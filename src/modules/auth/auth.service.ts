import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtPayloadSecret } from '../../shared/types/jwt-payload.type';
import { encrypt } from '../../shared/utils/encrypt/encrypt.util';
import { User } from '../user/entities/user.entity';

import { LoginDto } from './dto/login.dto';
import { JwtIdService } from './jwt-id/jwt-id.service';
import { JwtWrapperService } from './jwt-wrapper/jwt-wrapper.service';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private readonly jwtWrapperService: JwtWrapperService,
		private readonly jwtIdService: JwtIdService,
	) {}
	/**
	 * Logs the user in by validating credentials and returning JWT tokens.
	 *
	 * @param loginDto - Contains user email and password for authentication.
	 * @returns JWT tokens for the authenticated user.
	 * @throws UnauthorizedException - If the credentials are invalid.
	 */
	async login({ email, password }: LoginDto) {
		const user = await this.userRepository.findOneBy({ email });
		if (!user || !(await encrypt.verify(password, user.password))) {
			throw new UnauthorizedException('Invalid credentials.');
		}
		return this.jwtWrapperService.generateTokens({
			userId: user.id,
		});
	}
	/**
	 * Logs out the user by deleting the JWT ID from the database.
	 *
	 * @param jti - The JWT ID to be deleted.
	 * @returns true if logout was successful.
	 */
	async logout(jti: string): Promise<boolean> {
		await this.jwtIdService.delete(jti);
		return true;
	}
	/**
	 * Refreshes the access token for the authenticated user.
	 *
	 * @param payload - JWT payload containing userId, role, and jti.
	 * @returns New access token.
	 */
	async refreshAccessToken(payload: JwtPayloadSecret) {
		const accessToken =
			await this.jwtWrapperService.refreshAccessToken(payload);
		return { accessToken };
	}
}
