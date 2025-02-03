import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
	DurationStringValue,
	toMilliseconds,
} from '../../../shared/utils/ms/ms.util';
import { User } from '../../user/entities/user.entity';

import { JwtId } from './entities/jwt-id.entity';
import { JwtIdService } from './jwt-id.service';

const mockJwtIdRepository = () => ({
	create: jest.fn(),
	save: jest.fn(),
	findOne: jest.fn(),
	delete: jest.fn(),
});

const mockUser = {
	id: 'user-id',
	email: 'user@example.com',
	password: 'hashed-password',
	role: 'admin',
};

describe('JwtIdService', () => {
	let service: JwtIdService;
	let jwtIdRepository: Repository<JwtId>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				JwtIdService,
				{
					provide: getRepositoryToken(JwtId),
					useValue: mockJwtIdRepository(),
				},
			],
		}).compile();

		service = module.get<JwtIdService>(JwtIdService);
		jwtIdRepository = module.get<Repository<JwtId>>(getRepositoryToken(JwtId));
	});

	describe('create', () => {
		it('should create and save a JWT ID', async () => {
			const userId = 'user-id';
			const expiresIn: DurationStringValue = '1d'; // 1 day in milliseconds
			const expiresAt = new Date(Date.now() + toMilliseconds(expiresIn));

			const saveSpy = jest.spyOn(jwtIdRepository, 'save');
			const createSpy = jest.spyOn(jwtIdRepository, 'create').mockReturnValue({
				id: 'jwt-id',
				expiresAt,
				user: { id: userId } as User,
			});

			const result = await service.create(userId, expiresIn);
			expect(createSpy).toHaveBeenCalled();
			expect(saveSpy).toHaveBeenCalled();
			expect(result).toBe('jwt-id');
		});
	});

	describe('verify', () => {
		it('should throw UnauthorizedException if token is invalid or expired', async () => {
			const userId = 'user-id';
			const jwtid = 'invalid-jwt-id';

			jest.spyOn(jwtIdRepository, 'findOne').mockResolvedValue(null);

			await expect(service.verify(userId, jwtid)).rejects.toThrowError(
				new UnauthorizedException('Invalid token'),
			);
		});

		it('should return the user if the token is valid', async () => {
			const userId = 'user-id';
			const jwtid = 'valid-jwt-id';
			const mockJwtIdEntity = {
				id: jwtid,
				expiresAt: new Date(Date.now() + 10000), // valid token not expired
				user: mockUser,
			};

			jest
				.spyOn(jwtIdRepository, 'findOne')
				.mockResolvedValue(mockJwtIdEntity as JwtId);

			const user = await service.verify(userId, jwtid);
			expect(user).toBe(mockUser);
		});
	});

	describe('delete', () => {
		it('should delete the JWT ID successfully', async () => {
			const deleteSpy = jest
				.spyOn(jwtIdRepository, 'delete')
				.mockResolvedValue({ raw: '', affected: 1 });

			const result = await service.delete('jwt-id');
			expect(deleteSpy).toHaveBeenCalledWith('jwt-id');
			expect(result).toBe(true);
		});
	});
});
