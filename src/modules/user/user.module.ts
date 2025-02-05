import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { API_SYNC_QUEUE } from '../../shared/constants/queues/queues.contants';
import { AuditService } from '../libs/audit/audit.service';
import { AuditLog } from '../libs/audit/entities/audit.entity';
import { ApiSyncProducer } from '../queues/api-sync/api-sync-queue.producer';

import { AuditLogUserService } from './audit-log.user.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, AuditLog]),
		BullModule.registerQueue({ name: API_SYNC_QUEUE }),
	],
	controllers: [UserController],
	providers: [UserService, AuditService, AuditLogUserService, ApiSyncProducer],
	exports: [TypeOrmModule],
})
export class UserModule {}
