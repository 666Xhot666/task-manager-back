import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayloadSecret } from '../../../shared/types/jwt-payload.type';
import { JwtIdService } from '../jwt-id/jwt-id.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtIdService: JwtIdService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
			ignoreExpiration: false,
		});
	}
	async validate(payload: JwtPayloadSecret) {
		const user = await this.jwtIdService.verify(payload.userId, payload.jti);
		return { user, jti: payload.jti };
	}
}
