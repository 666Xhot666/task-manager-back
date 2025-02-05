import { Injectable, Logger } from '@nestjs/common';

import { AuditService } from '../libs/audit/audit.service';
import { ActionTypes, EntityType } from '../libs/audit/entities/audit.entity';
import { User } from '../user/entities/user.entity';

import { Project } from './entities/project.entity';

@Injectable()
export class AuditLogProjectService {
	private readonly logger = new Logger(AuditLogProjectService.name);

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
		this.logger.log(
			`Logging CREATE action for project ID: ${createdProject.id}`,
		);

		try {
			await this.auditService.logEvent(
				this.sanitizeData.bind(this),
				user,
				ActionTypes.CREATE,
				EntityType.PROJECT,
				createdProject.id,
				{},
				createdProject,
			);
			this.logger.log(
				`Successfully logged CREATE action for project ID: ${createdProject.id}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to log CREATE action for project ID: ${createdProject.id}. Error: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
		}
	}

	async logUpdate(
		user: User,
		oldProject: Project,
		updatedProject: Project,
	): Promise<void> {
		this.logger.log(
			`Logging UPDATE action for project ID: ${updatedProject.id}`,
		);

		try {
			await this.auditService.logEvent(
				this.sanitizeData.bind(this),
				user,
				ActionTypes.UPDATE,
				EntityType.PROJECT,
				updatedProject.id,
				oldProject,
				updatedProject,
			);
			this.logger.log(
				`Successfully logged UPDATE action for project ID: ${updatedProject.id}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to log UPDATE action for project ID: ${updatedProject.id}. Error: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
		}
	}

	async logDelete(user: User, deletedProject: Project): Promise<void> {
		this.logger.log(
			`Logging DELETE action for project ID: ${deletedProject.id}`,
		);

		try {
			await this.auditService.logEvent(
				this.sanitizeData.bind(this),
				user,
				ActionTypes.DELETE,
				EntityType.PROJECT,
				deletedProject.id,
				deletedProject,
				{},
			);
			this.logger.log(
				`Successfully logged DELETE action for project ID: ${deletedProject.id}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to log DELETE action for project ID: ${deletedProject.id}. Error: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
		}
	}
}
