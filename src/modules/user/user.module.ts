import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditService } from '../libs/audit/audit.service';
import { AuditLog } from '../libs/audit/entities/audit.entity';

import { AuditLogUserService } from './audit-log.user.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, AuditLog])],
	controllers: [UserController],
	providers: [UserService, AuditService, AuditLogUserService],
	exports: [TypeOrmModule],
})
export class UserModule {}
