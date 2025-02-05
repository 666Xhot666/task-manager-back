import { Injectable, Logger } from '@nestjs/common';

import { AuditService } from '../libs/audit/audit.service';
import { ActionTypes, EntityType } from '../libs/audit/entities/audit.entity';
import { User } from '../user/entities/user.entity';

import { Task } from './entities/task.entity';

@Injectable()
export class AuditLogTaskService {
	private readonly logger = new Logger(AuditLogTaskService.name);

	constructor(private readonly auditService: AuditService) {}

	private sanitizeData(data: Task): Record<string, any> {
		if (!data) return {};
		return {
			id: data.id ?? '',
			title: data.title ?? '',
			assigneeId: data.assigneeId ?? '',
			status: data.status ?? '',
			deadline: data.deadline ?? '',
			projectId: data.projectId ?? '',
		};
	}

	/**
	 * Logs the creation of a task and details the event.
	 * @param user The user creating the task.
	 * @param createdTask The task that is being created.
	 */
	async logCreate(user: User, createdTask: Task): Promise<void> {
		this.logger.log(
			`User ${user.id} is creating a task with ID ${createdTask.id}. Task title: "${createdTask.title}".`,
		);
		try {
			await this.auditService.logEvent(
				this.sanitizeData.bind(this),
				user,
				ActionTypes.CREATE,
				EntityType.TASK,
				createdTask.id.toString(),
				{},
				createdTask,
			);
			this.logger.log(
				`Task creation logged successfully for task ID ${createdTask.id}.`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to log creation of task ID ${createdTask.id} by user ${user.id}: ${error instanceof Error ? error.message : 'Error'}`,
			);
		}
	}

	/**
	 * Logs the update of a task and details the event.
	 * @param user The user updating the task.
	 * @param oldTask The original task data before update.
	 * @param updatedTask The task data after the update.
	 */
	async logUpdate(user: User, oldTask: Task, updatedTask: Task): Promise<void> {
		this.logger.log(
			`User ${user.id} is updating task with ID ${updatedTask.id}. Changes: ` +
				`Title: "${oldTask.title}" → "${updatedTask.title}", ` +
				`Status: "${oldTask.status}" → "${updatedTask.status}".`,
		);
		try {
			await this.auditService.logEvent(
				this.sanitizeData.bind(this),
				user,
				ActionTypes.UPDATE,
				EntityType.TASK,
				updatedTask.id.toString(),
				oldTask,
				updatedTask,
			);
			this.logger.log(
				`Task update logged successfully for task ID ${updatedTask.id}.`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to log update of task ID ${updatedTask.id} by user ${user.id}: ${error instanceof Error ? error.message : 'Error'}`,
			);
		}
	}

	/**
	 * Logs the deletion of a task and details the event.
	 * @param user The user deleting the task.
	 * @param deletedTask The task that is being deleted.
	 */
	async logDelete(user: User, deletedTask: Task): Promise<void> {
		this.logger.log(
			`User ${user.id} is deleting task with ID ${deletedTask.id}. Task title: "${deletedTask.title}".`,
		);
		try {
			await this.auditService.logEvent(
				this.sanitizeData.bind(this),
				user,
				ActionTypes.DELETE,
				EntityType.TASK,
				deletedTask.id.toString(),
				deletedTask,
				{},
			);
			this.logger.log(
				`Task deletion logged successfully for task ID ${deletedTask.id}.`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to log deletion of task ID ${deletedTask.id} by user ${user.id}: ${error instanceof Error ? error.message : 'Error'}`,
			);
		}
	}
}
