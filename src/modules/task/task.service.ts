import {
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { CacheService } from '../../core/services/cache.service';
import { Project } from '../project/entities/project.entity';
import { EmailQueueProducer } from '../queues/email/email-queue.producer';
import { EmailJobPriority } from '../queues/email/email-queue.types';
import { User, UserRole } from '../user/entities/user.entity';

import { AuditLogTaskService } from './audit-log.task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskFilterDto } from './dto/filter-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';
import { TaskGateway } from './task.gateway';

@Injectable()
export class TaskService {
	private readonly logger = new Logger(TaskService.name);
	private readonly CACHE_TTL = 60;
	private readonly CACHE_PREFIX = 'tasks';

	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
		private readonly auditLogTaskService: AuditLogTaskService,
		private readonly cacheService: CacheService,
		private readonly emailQueueProducer: EmailQueueProducer,
		private readonly taskGateway: TaskGateway,
	) {}
	/**
	 * Creates a new task after validating user access and assignee existence.
	 * Logs detailed info before creating the task and generated query debug logs.
	 *
	 * @param user - The user creating the task.
	 * @param createTaskDto - The data transfer object containing task creation details.
	 * @returns The created task.
	 * @throws ForbiddenException if the user role is Performer.
	 * @throws NotFoundException if the project or assignee is not found.
	 */
	async create(user: User, createTaskDto: CreateTaskDto) {
		this.logger.debug(`User ${user.id} is attempting to create a task.`);
		this.checkForRoleAccess(user.role, [UserRole.PERFORMER]);

		await this.validateProjectAccess(user, createTaskDto.projectId);
		await this.ensureAssigneeExists(createTaskDto.assigneeId);

		const task = this.taskRepository.create(createTaskDto);
		this.logger.debug(`Created task entity: ${JSON.stringify(task)}`);

		await this.auditLogTaskService.logCreate(user, task);
		const savedTask = await this.taskRepository.save(task);
		await this.emailQueueProducer.addTaskAssignedEmail(
			{
				taskId: task.id.toString(),
				to: task.assignee.id,
				data: {
					taskName: task.title,
					taskLink: `${task.id}`,
					projectName: `${task.project.title}`,
					assignedBy: user.email,
				},
			},
			EmailJobPriority.HIGH,
		);

		this.taskGateway.notifyTaskCreated(savedTask, user.id);
		this.logger.log(`Task created successfully with ID ${savedTask.id}`);
		return savedTask;
	}

	/**
	 * Retrieves all tasks based on user role and filters.
	 * Logs the generated SQL query before execution.
	 *
	 * @param user - The user requesting the tasks.
	 * @param filters - The filters to apply on task search.
	 * @returns A list of tasks matching the filters.
	 */
	async findAll(user: User, filters: TaskFilterDto): Promise<Task[]> {
		const cacheKey = this.cacheService.generateKey(
			this.CACHE_PREFIX,
			user.id,
			JSON.stringify(filters),
		);
		return this.cacheService.getOrSet(
			cacheKey,
			async () => {
				const query = this.buildBaseQuery(user);

				this.applyFilters(query, filters, user.role);
				this.applySorting(query, filters.sortBy, filters.order);

				this.logger.debug(
					'Generated SQL query for finding all tasks: ',
					query.getQuery(),
				);

				return query.getMany();
			},
			this.CACHE_TTL,
		);
	}

	/**
	 * Retrieves a specific task by its ID.
	 * Logs the generated SQL query before execution.
	 *
	 * @param user - The user requesting the task.
	 * @param id - The ID of the task to retrieve.
	 * @returns The task if found, or null if not found.
	 */
	async findOne(user: User, id: number) {
		const cacheKey = this.cacheService.generateKey(
			this.CACHE_PREFIX,
			id.toString(),
			user.id.toString(),
		);
		return this.cacheService.getOrSet(
			cacheKey,
			async () => {
				const query = this.buildBaseQuery(user);
				query.andWhere('task.id = :id', { id });

				this.logger.debug(
					'Generated SQL query for finding task by ID: ',
					query.getQuery(),
				);

				return query.getOne();
			},
			this.CACHE_TTL,
		);
	}

	/**
	 * Updates a specific task by its ID.
	 * Logs the changes and generated SQL query before execution.
	 *
	 * @param user - The user requesting the update.
	 * @param id - The ID of the task to update.
	 * @param updateTaskDto - The data to update the task with.
	 * @returns The updated task.
	 * @throws NotFoundException if the task is not found.
	 */
	async update(user: User, id: number, updateTaskDto: UpdateTaskDto) {
		this.logger.debug(
			`User ${user.id} is attempting to update task with ID ${id}.`,
		);
		const query = this.buildBaseQuery(user);
		query.andWhere('task.id = :id', { id });

		const task = await query.getOne();
		if (!task) {
			this.logger.warn(`Task with ID ${id} not found.`);
			throw new NotFoundException(`Task with ID ${id} not found.`);
		}

		await this.updateTaskProperties(user, task, updateTaskDto);
		const updatedTask = await this.taskRepository.save(task);
		await this.auditLogTaskService.logUpdate(user, task, updatedTask);
		await this.invalidateCacheKey(id, user);
		this.taskGateway.notifyTaskUpdated(updatedTask, user.id);

		this.logger.log(
			`Task ${updatedTask.id} updated successfully: ${JSON.stringify(updatedTask, null, 2)}`,
		);
		return updatedTask;
	}

	/**
	 * Deletes a specific task by its ID.
	 * Logs the task deletion and generated SQL query before execution.
	 *
	 * @param user - The user requesting the deletion.
	 * @param id - The ID of the task to delete.
	 * @returns The deleted task.
	 * @throws ForbiddenException if the user role is Performer.
	 * @throws NotFoundException if the task is not found.
	 */
	async remove(user: User, id: number) {
		this.logger.debug(
			`User ${user.id} is attempting to delete task with ID ${id}.`,
		);
		this.checkForRoleAccess(user.role, [UserRole.PERFORMER]);

		const query = this.buildBaseQuery(user);
		query.andWhere('task.id = :id', { id });

		const task = await query.getOne();
		if (!task) {
			this.logger.warn(`Task with ID ${id} not found.`);
			throw new NotFoundException(`Task with ID ${id} not found.`);
		}
		const removedTask = await this.taskRepository.remove(task);
		await this.auditLogTaskService.logDelete(user, task);
		await this.invalidateCacheKey(id, user);
		this.logger.log(`Task ${removedTask.id} deleted successfully.`);
		return removedTask;
	}

	private async invalidateCacheKey(id: number, user: User) {
		const cacheKey = this.cacheService.generateKey(
			this.CACHE_PREFIX,
			id.toString(),
			user.id.toString(),
		);
		await this.cacheService.delete(cacheKey);
	}
	/**
	 * Checks if the user has access based on their role.
	 *
	 * @param userRole - The role of the user.
	 * @param restrictedRoles - The roles that are restricted from performing the action.
	 * @throws ForbiddenException if the user has the restricted role.
	 */
	private checkForRoleAccess(userRole: UserRole, restrictedRoles: UserRole[]) {
		if (restrictedRoles.includes(userRole)) throw new ForbiddenException();
	}
	/**
	 * Validates if the user has access to the specified project.
	 *
	 * @param user - The user requesting the project validation.
	 * @param projectId - The ID of the project to validate.
	 * @throws NotFoundException if the project is not found or the user doesn't have access.
	 */
	private async validateProjectAccess(user: User, projectId: string) {
		const projectQuery = this.projectRepository.createQueryBuilder('project');

		if (user.role === UserRole.MANAGER) {
			projectQuery.andWhere('project.teamHeadId = :userId', {
				userId: user.id,
			});
		}

		const project = await projectQuery
			.andWhere('project.id = :projectId', { projectId })
			.getOne();
		if (!project)
			throw new NotFoundException('Project not found or user has no access.');
	}
	/**
	 * Ensures that the assignee exists in the system.
	 *
	 * @param assigneeId - The ID of the assignee to validate.
	 * @throws NotFoundException if the assignee is not found.
	 */
	private async ensureAssigneeExists(assigneeId: string) {
		const assignee = await this.userRepository.findOneBy({ id: assigneeId });
		if (!assignee) throw new NotFoundException('Assignee not found.');
	}
	/**
	 * Builds the base query for fetching tasks, applying role-based access controls.
	 *
	 * @param user - The user requesting the task list.
	 * @returns A query builder for tasks with the appropriate access controls applied.
	 */
	private buildBaseQuery(user: User): SelectQueryBuilder<Task> {
		const query = this.taskRepository
			.createQueryBuilder('task')
			.leftJoinAndSelect('task.project', 'project');

		this.applyRoleBasedAccess(query, user);

		return query;
	}
	/**
	 * Applies role-based access control to the query to restrict task visibility.
	 *
	 * @param query - The query to apply role-based access to.
	 * @param user - The user whose role will be used to apply access control.
	 */
	private applyRoleBasedAccess(
		query: SelectQueryBuilder<Task>,
		user: User,
	): void {
		const roleConditions: Record<UserRole, () => void> = {
			[UserRole.MANAGER]: () =>
				query.where(
					'task.projectId IN (SELECT id FROM project WHERE teamHeadId = :teamHeadId)',
					{ teamHeadId: user.id },
				),
			[UserRole.PERFORMER]: () =>
				query.where('task.assigneeId = :assigneeId', { assigneeId: user.id }),
			[UserRole.ADMIN]: () => {}, // No restrictions for Admin
		};

		const applyAccessControl = roleConditions[user.role];
		if (applyAccessControl) {
			applyAccessControl();
		} else {
			throw new ForbiddenException('Access denied');
		}
	}
	/**
	 * Applies filters to the task query based on user role and filter parameters.
	 *
	 * @param query - The query to apply filters to.
	 * @param filters - The filter conditions.
	 * @param userRole - The role of the user requesting the tasks.
	 */
	private applyFilters(
		query: SelectQueryBuilder<Task>,
		filters: TaskFilterDto,
		userRole: UserRole,
	): void {
		const conditions: [string, Record<string, any>][] = [];

		if (userRole === UserRole.ADMIN && filters.teamId) {
			conditions.push([
				'task.projectId IN (SELECT id FROM project WHERE teamHeadId = :teamId)',
				{ teamId: filters.teamId },
			]);
		}
		if (filters.title) {
			conditions.push([
				'LOWER(task.title) LIKE LOWER(:title)',
				{ title: `%${filters.title}%` },
			]);
		}
		if (filters.status) {
			conditions.push(['task.status = :status', { status: filters.status }]);
		}
		if (filters.projectId) {
			conditions.push([
				'task.projectId = :projectId',
				{ projectId: filters.projectId },
			]);
		}
		if (userRole !== UserRole.PERFORMER && filters.assigneeId) {
			conditions.push([
				'task.assigneeId = :assigneeId',
				{ assigneeId: filters.assigneeId },
			]);
		}
		if (filters.deadlineFrom) {
			conditions.push([
				'task.deadline >= :deadlineFrom',
				{ deadlineFrom: filters.deadlineFrom },
			]);
		}
		if (filters.deadlineTo) {
			conditions.push([
				'task.deadline <= :deadlineTo',
				{ deadlineTo: filters.deadlineTo },
			]);
		}

		conditions.forEach(([clause, params]) => query.andWhere(clause, params));
	}
	/**
	 * Applies sorting to the task query based on the specified column and order.
	 *
	 * @param query - The query to apply sorting to.
	 * @param sortBy - The column to sort by.
	 * @param order - The order direction (ASC or DESC).
	 */
	private applySorting(
		query: SelectQueryBuilder<Task>,
		sortBy?: string,
		order: 'ASC' | 'DESC' = 'ASC',
	): void {
		if (!sortBy) return;

		const validColumns = this.taskRepository.metadata.columns.map(
			(col) => col.propertyName,
		);
		if (validColumns.includes(sortBy)) {
			query.orderBy(`task.${sortBy}`, order);
		}
	}
	/**
	 * Updates task properties based on the user role.
	 *
	 * @param user - The user performing the update.
	 * @param task - The task to update.
	 * @param updateTaskDto - The data to update the task with.
	 */
	private async updateTaskProperties(
		user: User,
		task: Task,
		updateTaskDto: UpdateTaskDto,
	) {
		if (
			updateTaskDto.status === TaskStatus.DONE &&
			task.status !== TaskStatus.DONE
		) {
			task.completedAt = new Date();
			await this.emailQueueProducer.addTaskCompleteEmail(
				{
					to: task.project.teamHead.email,
					taskId: task.id.toString(),
					data: {
						taskName: task.title,
						managerName: task.project.teamHead.email,
						performerName: task.assignee.email,
						projectName: task.project.title,
						taskUrl: `/${task.id}`,
					},
				},
				EmailJobPriority.HIGH,
			);
		}
		if ([UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
			Object.assign(task, updateTaskDto);
		} else {
			Object.assign(task, { status: updateTaskDto.status });
		}
	}
}
