import { Injectable } from '@nestjs/common';

import { AuditService } from '../libs/audit/audit.service';
import { ActionTypes, EntityType } from '../libs/audit/entities/audit.entity';
import { User } from '../user/entities/user.entity';

import { Project } from './entities/project.entity';

@Injectable()
export class AuditLogProjectService {
	constructor(private readonly auditService: AuditService) {}

	private sanitizeData(data: Project): Record<string, any> {
		if (!data) return {};
		return {
			id: data.id ?? '',
			title: data.title ?? '',
			description: data.description ?? '',
			status: data.status ?? '',
			teamHeadId: data.teamHeadId ?? '',
		};
	}

	async logCreate(user: User, createdProject: Project): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.CREATE,
			EntityType.PROJECT,
			createdProject.id,
			{},
			createdProject,
		);
	}

	async logUpdate(
		user: User,
		oldProject: Project,
		updatedProject: Project,
	): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.UPDATE,
			EntityType.PROJECT,
			updatedProject.id,
			oldProject,
			updatedProject,
		);
	}

	async logDelete(user: User, deletedProject: Project): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.DELETE,
			EntityType.PROJECT,
			deletedProject.id,
			deletedProject,
			{},
		);
	}
}
