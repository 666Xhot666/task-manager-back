import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtId } from './jwt-id/entities/jwt-id.entity';
import { JwtIdService } from './jwt-id/jwt-id.service';
import { JwtWrapperService } from './jwt-wrapper/jwt-wrapper.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
	imports: [TypeOrmModule.forFeature([User, JwtId])],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtWrapperService,
		JwtIdService,
		JwtService,
		AccessTokenStrategy,
		RefreshTokenStrategy,
	],
})
export class AuthModule {}
