import { Injectable, Logger } from '@nestjs/common';

import { AuditService } from '../libs/audit/audit.service';
import { ActionTypes, EntityType } from '../libs/audit/entities/audit.entity';

import { User } from './entities/user.entity';

@Injectable()
export class AuditLogUserService {
	private readonly logger = new Logger(AuditLogUserService.name);

	constructor(private readonly auditService: AuditService) {}

	/**
	 * Sanitizes user data for audit logging.
	 * @param data - The user data to sanitize.
	 * @returns Sanitized data object.
	 */
	private sanitizeData(data: User): Record<string, any> {
		if (!data) return {};
		return {
			id: data.id ?? '',
			email: data.email ?? '',
			role: data.role ?? '',
		};
	}

	/**
	 * Logs the creation of a user.
	 * @param user - The user performing the action.
	 * @param createdUser - The user that was created.
	 */
	async logCreate(user: User, createdUser: User): Promise<void> {
		this.logger.log(
			`Logging CREATE event for user ${createdUser.id} by ${user.id}`,
		);
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.CREATE,
			EntityType.USER,
			createdUser.id,
			{},
			createdUser,
		);
		this.logger.log(
			`Successfully logged CREATE event for user ${createdUser.id}`,
		);
	}

	/**
	 * Logs the update of a user.
	 * @param user - The user performing the update action.
	 * @param oldUser - The user data before update.
	 * @param updatedUser - The user data after update.
	 */
	async logUpdate(user: User, oldUser: User, updatedUser: User): Promise<void> {
		this.logger.log(
			`Logging UPDATE event for user ${updatedUser.id} by ${user.id}`,
		);
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.UPDATE,
			EntityType.USER,
			updatedUser.id,
			oldUser,
			updatedUser,
		);
		this.logger.log(
			`Successfully logged UPDATE event for user ${updatedUser.id}`,
		);
	}

	/**
	 * Logs the deletion of a user.
	 * @param user - The user performing the delete action.
	 * @param deletedUser - The user to be deleted.
	 */
	async logDelete(user: User, deletedUser: User): Promise<void> {
		this.logger.log(
			`Logging DELETE event for user ${deletedUser.id} by ${user.id}`,
		);
		await this.auditService.logEvent(
			this.sanitizeData.bind(this),
			user,
			ActionTypes.DELETE,
			EntityType.USER,
			deletedUser.id,
			deletedUser,
			{},
		);
		this.logger.log(
			`Successfully logged DELETE event for user ${deletedUser.id}`,
		);
	}
}
