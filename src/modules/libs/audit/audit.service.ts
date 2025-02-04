import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity';

import { ActionTypes, AuditLog, EntityType } from './entities/audit.entity';

@Injectable()
export class AuditService {
	private readonly logger = new ConsoleLogger(AuditService.name);

	constructor(
		@InjectRepository(AuditLog)
		private readonly auditLogRepository: Repository<AuditLog>,
	) {}

	async logEvent(
		sanitizeData: (data: unknown) => Record<string, any>,
		user: User,
		action: ActionTypes,
		entityType: EntityType,
		entityId: string,
		oldValue?: Record<string, any>,
		newValue?: Record<string, any>,
	): Promise<void> {
		try {
			const logEntry = this.auditLogRepository.create({
				action,
				entityType,
				entityId,
				oldValue: sanitizeData(oldValue),
				newValue: sanitizeData(newValue),
				performedBy: user,
			});

			await this.auditLogRepository.save(logEntry);
		} catch (error) {
			this.logger.error(
				`Failed to log audit event: ${error instanceof Error ? error.message : 'Ooops'}`,
				error instanceof Error ? error.stack : 'Ooops',
			);
		}
	}
}
