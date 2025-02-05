import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../../core/services/cache.service';
import {
	API_SYNC_QUEUE,
	CLEANUP_QUEUE,
	EMAIL_QUEUE,
} from '../../shared/constants/queues/queues.contants';
import { AuditService } from '../libs/audit/audit.service';
import { AuditLog } from '../libs/audit/entities/audit.entity';
import { ApiSyncProducer } from '../queues/api-sync/api-sync-queue.producer';
import { CleanupQueueProducer } from '../queues/cleanup/cleanup-queue.producer';
import { EmailQueueProducer } from '../queues/email/email-queue.producer';
import { User } from '../user/entities/user.entity';

import { AuditLogProjectService } from './audit-log.project.service';
import { Project } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Project, User, AuditLog]),
		BullModule.registerQueue({ name: CLEANUP_QUEUE }),
		BullModule.registerQueue({ name: EMAIL_QUEUE }),
		BullModule.registerQueue({ name: API_SYNC_QUEUE }),
	],
	controllers: [ProjectController],
	providers: [
		ProjectService,
		AuditLogProjectService,
		AuditService,
		CacheService,
		CleanupQueueProducer,
		EmailQueueProducer,
		ApiSyncProducer,
	],
})
export class ProjectModule {}
