import { Injectable, UnauthorizedException } from '@nestjs/common';
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
			throw new UnauthorizedException('Invalid token');
		}
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
		return true;
	}
}
