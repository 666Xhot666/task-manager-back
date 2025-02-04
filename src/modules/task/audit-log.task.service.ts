import { Injectable } from '@nestjs/common';

import { AuditService } from '../libs/audit/audit.service';
import { ActionTypes, EntityType } from '../libs/audit/entities/audit.entity';
import { User } from '../user/entities/user.entity';

import { Task } from './entities/task.entity';

@Injectable()
export class AuditLogTaskService {
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

	async logCreate(user: User, createdTask: Task): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.CREATE,
			EntityType.TASK,
			createdTask.id.toString(),
			{},
			createdTask,
		);
	}

	async logUpdate(user: User, oldTask: Task, updatedTask: Task): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.UPDATE,
			EntityType.TASK,
			updatedTask.id.toString(),
			oldTask,
			updatedTask,
		);
	}

	async logDelete(user: User, deletedTask: Task): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.DELETE,
			EntityType.TASK,
			deletedTask.id.toString(),
			deletedTask,
			{},
		);
	}
}
