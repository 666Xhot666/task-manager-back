import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit.entity';

@Global()
@Module({
	imports: [TypeOrmModule.forFeature([AuditLog])],
	providers: [AuditService],
})
export class AuditModule {}
