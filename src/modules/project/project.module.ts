import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../../core/services/cache.service';
import { AuditService } from '../libs/audit/audit.service';
import { AuditLog } from '../libs/audit/entities/audit.entity';
import { User } from '../user/entities/user.entity';

import { AuditLogProjectService } from './audit-log.project.service';
import { Project } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
	imports: [TypeOrmModule.forFeature([Project, User, AuditLog])],
	controllers: [ProjectController],
	providers: [
		ProjectService,
		AuditLogProjectService,
		AuditService,
		CacheService,
	],
})
export class ProjectModule {}
