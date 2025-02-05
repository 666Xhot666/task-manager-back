import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtId } from './entities/jwt-id.entity';
import { JwtIdService } from './jwt-id.service';

@Module({
	imports: [TypeOrmModule.forFeature([JwtId])],
	providers: [JwtIdService],
})
export class JwtIdModule {}
