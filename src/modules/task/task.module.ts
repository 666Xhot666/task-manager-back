import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../../core/services/cache.service';
import { EMAIL_QUEUE } from '../../shared/constants/queues/queues.contants';
import { AuditService } from '../libs/audit/audit.service';
import { AuditLog } from '../libs/audit/entities/audit.entity';
import { Project } from '../project/entities/project.entity';
import { EmailQueueProducer } from '../queues/email/email-queue.producer';
import { User } from '../user/entities/user.entity';

import { AuditLogTaskService } from './audit-log.task.service';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskGateway } from './task.gateway';
import { TaskService } from './task.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Task, User, Project, AuditLog]),
		BullModule.registerQueue({ name: EMAIL_QUEUE }),
	],
	controllers: [TaskController],
	providers: [
		TaskService,
		AuditService,
		AuditLogTaskService,
		CacheService,
		EmailQueueProducer,
		TaskGateway,
	],
})
export class TaskModule {}
