import { Injectable } from '@nestjs/common';

import { AuditService } from '../libs/audit/audit.service';
import { ActionTypes, EntityType } from '../libs/audit/entities/audit.entity';

import { User } from './entities/user.entity';

@Injectable()
export class AuditLogUserService {
	constructor(private readonly auditService: AuditService) {}

	private sanitizeData(data: User): Record<string, any> {
		if (!data) return {};
		return {
			id: data.id ?? '',
			email: data.email ?? '',
			role: data.role ?? '',
		};
	}

	async logCreate(user: User, createdUser: User): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.CREATE,
			EntityType.USER,
			createdUser.id,
			{},
			createdUser,
		);
	}

	async logUpdate(user: User, oldUser: User, updatedUser: User): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.UPDATE,
			EntityType.USER,
			updatedUser.id,
			oldUser,
			updatedUser,
		);
	}

	async logDelete(user: User, deletedUser: User): Promise<void> {
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.DELETE,
			EntityType.USER,
			deletedUser.id,
			deletedUser,
			{},
		);
	}
}
