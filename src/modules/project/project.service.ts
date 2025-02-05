import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Task } from '../task/entities/task.entity';
import { User, UserRole } from '../user/entities/user.entity';

import { AuditLogProjectService } from './audit-log.project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectService {
	private readonly logger = new Logger(ProjectService.name);

	constructor(
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly auditLog: AuditLogProjectService,
	) {}

	/**
	 * Create a new project for the authenticated user.
	 * @param user - The currently authenticated user.
	 * @param createProjectDto - The DTO containing project creation details.
	 * @returns The created project.
	 * @throws ForbiddenException if the user is not allowed to create the project.
	 */
	async create(
		user: User,
		createProjectDto: CreateProjectDto,
	): Promise<Project> {
		this.logger.log(`User ${user.id} is attempting to create a project.`);
		this.validateTeamId(user, createProjectDto);
		const project = await this.createProject({
			...createProjectDto,
			teamId: user.id,
		});
		this.logger.log(
			`Project ${project.id} created successfully for user ${user.id}. ${JSON.stringify(project, null, 2)}`,
		);
		return project;
	}

	/**
	 * Create a new project as an admin.
	 * @param createProjectDto - The DTO containing project creation details.
	 * @returns The created project.
	 * @throws BadRequestException if the teamId is missing.
	 * @throws NotFoundException if the teamHead does not exist.
	 * @throws BadRequestException if the teamHead has invalid role.
	 */
	async createProjectByAdmin(
		createProjectDto: CreateProjectDto,
	): Promise<Project> {
		this.logger.log('Admin is attempting to create a project.');
		if (!createProjectDto.teamId) {
			this.logger.error('Team ID is missing for project creation.');
			throw new BadRequestException('Team id required for project creation');
		}
		const teamHead = await this.userRepository.findOneBy({
			id: createProjectDto.teamId,
		});
		if (!teamHead) {
			this.logger.error(
				`Team not found for project creation. ${createProjectDto.teamId}`,
			);
			throw new NotFoundException('Team not found');
		}
		if (teamHead.role === UserRole.PERFORMER) {
			this.logger.error(
				`Team head has insufficient permissions to perform project. ${teamHead.id} ${teamHead.role}`,
			);
			throw new BadRequestException(
				'Team does not have permission to perform this project',
			);
		}
		const project = await this.createProject(createProjectDto);
		this.logger.log(
			`Project ${project.id} created successfully by admin. ${JSON.stringify(project, null, 2)}`,
		);
		return project;
	}

	/**
	 * Retrieve all projects, with optional filtering based on user role and filter criteria.
	 * @param user - The currently authenticated user.
	 * @param filterProjectDTO - The DTO containing filter criteria.
	 * @returns A list of projects filtered based on the user's role and provided filters.
	 */
	async findAll(
		user: User,
		filterProjectDTO: FilterProjectDto,
	): Promise<Project[]> {
		this.logger.log(`User ${user.id} is retrieving projects.`);
		const query = this.projectRepository.createQueryBuilder('project');
		this.applyRoleBasedAccess(query, user);
		this.applyFilters(query, user, filterProjectDTO);
		this.applySorting(query, filterProjectDTO);
		this.logger.debug(
			`Query for find all with filter: ${JSON.stringify(filterProjectDTO, null, 2)}, query: ${query.getQuery()}`,
		);
		const projects = await query.getMany();
		this.logger.log(
			`Retrieved ${projects.length} projects for user ${user.id}.`,
		);
		return projects;
	}

	/**
	 * Retrieve a project by its ID.
	 * @param user - The currently authenticated user.
	 * @param id - The ID of the project to retrieve.
	 * @returns The project if found.
	 * @throws NotFoundException if the project is not found or the user has no access.
	 */
	async findOne(user: User, id: number): Promise<Project> {
		this.logger.log(`User ${user.id} is retrieving project with ID ${id}.`);
		const query = this.projectRepository.createQueryBuilder('project');
		this.applyRoleBasedAccess(query, user);
		const project = await query.andWhere('project.id = :id', { id }).getOne();
		if (!project) {
			this.logger.error(
				`Project with ID ${id} not found or access denied for user ${user.id}.`,
			);
			throw new NotFoundException(
				'Project not found or insufficient permissions',
			);
		}
		this.logger.log(`Project ${id} found for user ${user.id}.`);
		return project;
	}

	/**
	 * Update an existing project.
	 * @param user - The currently authenticated user.
	 * @param id - The ID of the project to update.
	 * @param updateProjectDto - The DTO containing the project update details.
	 * @returns The updated project.
	 * @throws NotFoundException if the project is not found.
	 */
	async update(
		user: User,
		id: number,
		updateProjectDto: UpdateProjectDto,
	): Promise<Project> {
		this.logger.log(`User ${user.id} is updating project with ID ${id}.`);
		const project = await this.findOne(user, id);
		this.assignUpdatesToProject(project, updateProjectDto);
		const updatedProject = await this.projectRepository.save(project);
		this.logger.log(`Project ${id} updated successfully by user ${user.id}.`);
		return updatedProject;
	}

	/**
	 * Delete a project.
	 * @param user - The currently authenticated user.
	 * @param id - The ID of the project to delete.
	 * @returns void
	 * @throws NotFoundException if the project is not found.
	 */
	async remove(user: User, id: number): Promise<void> {
		this.logger.log(`User ${user.id} is deleting project with ID ${id}.`);
		const project = await this.findOne(user, id);
		await this.projectRepository.remove(project);
		this.logger.log(`Project ${id} deleted successfully by user ${user.id}.`);
	}

	private validateTeamId(user: User, createProjectDto: CreateProjectDto): void {
		if (createProjectDto.teamId && user.id !== createProjectDto.teamId) {
			this.logger.error(
				`User ${user.id} attempted to create project for another user.`,
			);
			throw new ForbiddenException(
				'You are not allowed to create a project for another user',
			);
		}
	}

	private assignUpdatesToProject(
		project: Project,
		updateProjectDto: UpdateProjectDto,
	): void {
		if (
			updateProjectDto.status &&
			updateProjectDto.status === ProjectStatus.COMPLETED &&
			project.status !== ProjectStatus.COMPLETED
		) {
			project.completedAt = new Date();
		}
		Object.assign(project, updateProjectDto);
	}

	private applyFilters(
		query: SelectQueryBuilder<Project>,
		user: User,
		filterProjectDto: FilterProjectDto,
	): void {
		if (filterProjectDto.title) {
			query.andWhere('LOWER(project.name) LIKE LOWER(:name)', {
				name: `%${filterProjectDto.title}%`,
			});
		}
		if (filterProjectDto.status) {
			query.andWhere('LOWER(project.status) LIKE LOWER(:status)', {
				status: `%${filterProjectDto.status}`,
			});
		}
		if (filterProjectDto.teamId) {
			if (user.role !== UserRole.ADMIN) {
				this.logger.error(
					`User ${user.id} attempted to filter projects by team ID without admin rights.`,
				);
				throw new ForbiddenException('Filtration by team forbidden');
			}
			query.andWhere('project.teamHeadId = :teamId', {
				teamId: filterProjectDto.teamId,
			});
		}
	}

	private applySorting(
		query: SelectQueryBuilder<Project>,
		filterProjectDto: FilterProjectDto,
	): void {
		if (filterProjectDto.sortBy) {
			const validSortFields = Object.keys(Project);
			if (!validSortFields.includes(filterProjectDto.sortBy)) {
				this.logger.error(
					`Invalid sorting field provided: ${filterProjectDto.sortBy}`,
				);
				throw new BadRequestException('Invalid sorting field');
			}
			query.orderBy(
				`project.${filterProjectDto.sortBy}`,
				filterProjectDto.order || 'ASC',
			);
		}
	}

	private applyRoleBasedAccess(
		query: SelectQueryBuilder<Project>,
		user: User,
	): void {
		const roleConditions: Record<UserRole, () => void> = {
			[UserRole.MANAGER]: () =>
				query.andWhere('project.teamHeadId = :teamId', { teamId: user.id }),
			[UserRole.PERFORMER]: () => {
				this.logger.error(`User ${user.id} attempted to access project data.`);
				throw new ForbiddenException('Access forbidden');
			},
			[UserRole.ADMIN]: () => {}, // No restrictions for Admin
		};

		const applyAccessControl = roleConditions[user.role];
		if (applyAccessControl) {
			applyAccessControl();
		} else {
			this.logger.error(`Access denied for user ${user.id}.`);
			throw new ForbiddenException('Access denied');
		}
	}

	/**
	 * Private method to create a project record.
	 * @param data - The data to create the project.
	 * @returns The created project.
	 */
	private createProject(data: CreateProjectDto): Promise<Project> {
		const project = this.projectRepository.create({
			title: data.title,
			description: data.description,
			status: data.status,
			teamHead: {
				id: data.teamId,
			},
		});
		return this.projectRepository.save(project);
	}
}
