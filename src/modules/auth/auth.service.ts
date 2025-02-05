import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
	private readonly logger = new Logger(AuthService.name);

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
		this.logger.log(`Attempting to log in with email: ${email}`);

		const user = await this.userRepository.findOneBy({ email });
		if (!user) {
			this.logger.warn(`Login failed: No user found with email: ${email}`);
			throw new UnauthorizedException('Invalid credentials.');
		}

		const isPasswordValid = await encrypt.verify(password, user.password);
		if (!isPasswordValid) {
			this.logger.warn(`Login failed: Invalid password for email: ${email}`);
			throw new UnauthorizedException('Invalid credentials.');
		}

		this.logger.log(`Login successful for email: ${email}`);

		const tokens = await this.jwtWrapperService.generateTokens({
			userId: user.id,
		});
		this.logger.log(
			`Generated JWT tokens for user: ${email} === ${JSON.stringify(tokens, null, 2)}`,
		);

		return tokens;
	}

	/**
	 * Logs out the user by deleting the JWT ID from the database.
	 *
	 * @param jti - The JWT ID to be deleted.
	 * @returns true if logout was successful.
	 */
	async logout(jti: string): Promise<boolean> {
		this.logger.log(`Attempting to log out with JWT ID: ${jti}`);

		await this.jwtIdService.delete(jti);
		this.logger.log(`JWT ID ${jti} deleted. User logged out successfully.`);

		return true;
	}

	/**
	 * Refreshes the access token for the authenticated user.
	 *
	 * @param payload - JWT payload containing userId, role, and jti.
	 * @returns New access token.
	 */
	async refreshAccessToken(payload: JwtPayloadSecret) {
		this.logger.log(`Refreshing access token for userId: ${payload.userId}`);

		const accessToken =
			await this.jwtWrapperService.refreshAccessToken(payload);
		this.logger.log(
			`Access token refreshed for userId: ${payload.userId} === ${accessToken}`,
		);

		return { accessToken };
	}
}
