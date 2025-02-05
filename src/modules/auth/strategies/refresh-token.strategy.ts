import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayloadSecret } from '../../../shared/types/jwt-payload.type';
import { JwtIdService } from '../jwt-id/jwt-id.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	private readonly logger = new Logger(RefreshTokenStrategy.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly jwtIdService: JwtIdService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			ignoreExpiration: false,
		});
	}

	async validate(payload: JwtPayloadSecret) {
		this.logger.log(
			`Validating refresh token for user ${payload.userId} with jti ${payload.jti}`,
		);

		try {
			const user = await this.jwtIdService.verify(payload.userId, payload.jti);
			this.logger.log(
				`Token validated successfully for user ${payload.userId}`,
			);
			return { user, jti: payload.jti };
		} catch (error) {
			this.logger.error(
				`Failed to validate refresh token for user ${payload.userId} with jti ${payload.jti}`,
				error instanceof Error ? error.stack : 'Validation Failed',
			);
			throw error;
		}
	}
}
