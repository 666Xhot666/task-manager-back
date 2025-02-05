import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtId } from '../jwt-id/entities/jwt-id.entity';
import { JwtIdService } from '../jwt-id/jwt-id.service';

import { JwtWrapperService } from './jwt-wrapper.service';

@Module({
	imports: [TypeOrmModule.forFeature([JwtId])],
	providers: [JwtWrapperService, JwtService, JwtIdService],
})
export class JwtWrapperModule {}
