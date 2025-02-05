import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditService } from '../libs/audit/audit.service';
import { AuditLog } from '../libs/audit/entities/audit.entity';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';

import { AuditLogTaskService } from './audit-log.task.service';
import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CacheService } from '../../core/services/cache.service';

@Module({
	imports: [TypeOrmModule.forFeature([Task, User, Project, AuditLog])],
	controllers: [TaskController],
	providers: [TaskService, AuditService, AuditLogTaskService, CacheService],
})
export class TaskModule {}
