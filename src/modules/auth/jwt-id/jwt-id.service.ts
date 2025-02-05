import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import {
	DurationStringValue,
	toMilliseconds,
} from '../../../shared/utils/ms/ms.util';
import { User } from '../../user/entities/user.entity';

import { JwtId } from './entities/jwt-id.entity';

@Injectable()
export class JwtIdService {
	private readonly logger = new Logger(JwtIdService.name);

	constructor(
		@InjectRepository(JwtId)
		private readonly jwtIdRepository: Repository<JwtId>,
	) {}

	/**
	 * Create a new JWT ID and associate it with a user.
	 *
	 * @param userId The ID of the user.
	 * @param expiresIn The duration for which the JWT will be valid.
	 * @returns The created JWT ID.
	 */
	async create(
		userId: string,
		expiresIn: DurationStringValue,
	): Promise<string> {
		const expiresAt = new Date(Date.now() + toMilliseconds(expiresIn));
		const jwtId = this.jwtIdRepository.create({
			expiresAt,
			user: {
				id: userId,
			},
		});

		await this.jwtIdRepository.save(jwtId);
		this.logger.log(
			`Created JWT ID for user ${userId} with expiry at ${expiresAt.toISOString()}`,
		);
		return jwtId.id;
	}

	/**
	 * Verify the provided JWT ID for the user and check if it's valid and not expired.
	 *
	 * @param userId The ID of the user.
	 * @param jwtid The JWT ID to verify.
	 * @returns The user associated with the valid JWT ID.
	 * @throws UnauthorizedException if the token is invalid or expired.
	 */
	async verify(userId: string, jwtid: string): Promise<User> {
		const jwtidEntity = await this.jwtIdRepository.findOne({
			where: {
				id: jwtid,
				expiresAt: MoreThan(new Date()),
				user: {
					id: userId,
				},
			},
			relations: ['user'],
		});

		if (!jwtidEntity) {
			this.logger.warn(`Invalid or expired JWT ID provided for user ${userId}`);
			throw new UnauthorizedException('Invalid token');
		}

		this.logger.log(`Verified JWT ID for user ${userId}`);
		return jwtidEntity.user;
	}

	/**
	 * Delete a JWT ID.
	 *
	 * @param id The ID of the JWT ID to delete.
	 * @returns True if the deletion was successful.
	 */
	async delete(id: string) {
		await this.jwtIdRepository.delete(id);
		this.logger.log(`Deleted JWT ID with ID ${id}`);
		return true;
	}
}
