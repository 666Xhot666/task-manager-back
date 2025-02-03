import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
	JwtPayload,
	JwtPayloadSecret,
} from '../../../shared/types/jwt-payload.type';
import { DurationStringValue } from '../../../shared/utils/ms/ms.util';
import { JwtIdService } from '../jwt-id/jwt-id.service';

@Injectable()
export class JwtWrapperService {
	private readonly ACCESS_SECRET: string;
	private readonly REFRESH_SECRET: string;
	private readonly ACCESS_EXPIRES_IN: DurationStringValue;
	private readonly REFRESH_EXPIRES_IN: DurationStringValue;
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly jwtIdService: JwtIdService,
	) {
		this.ACCESS_SECRET = configService.getOrThrow<string>('JWT_ACCESS_SECRET');
		this.REFRESH_SECRET =
			configService.getOrThrow<string>('JWT_REFRESH_SECRET');
		this.ACCESS_EXPIRES_IN = configService.getOrThrow<DurationStringValue>(
			'JWT_ACCESS_EXPIRES_IN',
		);
		this.REFRESH_EXPIRES_IN = configService.getOrThrow<DurationStringValue>(
			'JWT_REFRESH_EXPIRES_IN',
		);
	}

	async generateTokens(payload: JwtPayload) {
		const secret = await this.jwtIdService.create(
			payload.userId,
			this.REFRESH_EXPIRES_IN,
		);
		const tokenPayload: JwtPayloadSecret = {
			...payload,
			jti: secret,
		};

		return Object.fromEntries(
			await Promise.all([
				['accessToken', await this.createToken(tokenPayload, 'access')],
				['refreshToken', await this.createToken(tokenPayload, 'refresh')],
			]),
		) as { accessToken: string; refreshToken: string };
	}

	private createToken(payload: JwtPayloadSecret, type: 'access' | 'refresh') {
		return this.jwtService.signAsync(payload, {
			expiresIn:
				type === 'access' ? this.ACCESS_EXPIRES_IN : this.REFRESH_EXPIRES_IN,
			secret: type === 'access' ? this.ACCESS_SECRET : this.REFRESH_SECRET,
		});
	}

	async refreshAccessToken(payload: JwtPayloadSecret) {
		return this.jwtService.signAsync(payload, {
			expiresIn: this.ACCESS_EXPIRES_IN,
			secret: this.ACCESS_SECRET,
		});
	}
}
