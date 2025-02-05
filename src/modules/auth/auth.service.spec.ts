import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtPayloadSecret } from '../../shared/types/jwt-payload.type';
import { encrypt } from '../../shared/utils/encrypt/encrypt.util';
import { User, UserRole } from '../user/entities/user.entity';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtIdService } from './jwt-id/jwt-id.service';
import { JwtWrapperService } from './jwt-wrapper/jwt-wrapper.service';

jest.mock('../../shared/utils/encrypt/encrypt.util', () => ({
	encrypt: { verify: jest.fn() },
}));

describe('AuthService', () => {
	let authService: AuthService;
	let userRepository: Repository<User>;
	let jwtWrapperService: JwtWrapperService;
	let jwtIdService: JwtIdService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: getRepositoryToken(User),
					useValue: { findOneBy: jest.fn() },
				},
				{
					provide: JwtWrapperService,
					useValue: {
						generateTokens: jest.fn(),
						refreshAccessToken: jest.fn(),
					},
				},
				{ provide: JwtIdService, useValue: { delete: jest.fn() } },
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
		userRepository = module.get<Repository<User>>(getRepositoryToken(User));
		jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
		jwtIdService = module.get<JwtIdService>(JwtIdService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('login', () => {
		it('should return tokens for valid credentials', async () => {
			const loginDto: LoginDto = {
				email: 'test@test.com',
				password: 'password',
			};
			const user = {
				id: 'user-id',
				email: 'test@test.com',
				password: 'hashed-password',
				role: UserRole.PERFORMER,
			};
			const tokens = {
				accessToken: 'access-token',
				refreshToken: 'refresh-token',
			};

			jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
			jest.spyOn(encrypt, 'verify').mockResolvedValue(true);
			jest.spyOn(jwtWrapperService, 'generateTokens').mockResolvedValue(tokens);

			const result = await authService.login(loginDto);

			expect(result).toEqual(tokens);
			expect(userRepository.findOneBy).toHaveBeenCalledWith({
				email: loginDto.email,
			});
			expect(encrypt.verify).toHaveBeenCalledWith(
				loginDto.password,
				user.password,
			);
			expect(jwtWrapperService.generateTokens).toHaveBeenCalledWith({
				userId: user.id,
			});
		});

		it('should throw UnauthorizedException if user is not found', async () => {
			const loginDto: LoginDto = {
				email: 'invalid@test.com',
				password: 'password',
			};

			jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

			await expect(authService.login(loginDto)).rejects.toThrowError(
				UnauthorizedException,
			);
			await expect(authService.login(loginDto)).rejects.toThrow(
				'Invalid credentials.',
			);
		});

		it('should throw UnauthorizedException for incorrect password', async () => {
			const loginDto: LoginDto = {
				email: 'test@test.com',
				password: 'incorrect-password',
			};
			const user = {
				id: 'user-id',
				email: 'test@test.com',
				password: 'hashed-password',
				role: UserRole.PERFORMER,
			};

			jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
			jest.spyOn(encrypt, 'verify').mockResolvedValue(false);

			await expect(authService.login(loginDto)).rejects.toThrowError(
				UnauthorizedException,
			);
			await expect(authService.login(loginDto)).rejects.toThrow(
				'Invalid credentials.',
			);
		});
	});

	describe('logout', () => {
		it('should return true when logout is successful', async () => {
			const jti = 'jwt-id-mock';
			jest.spyOn(jwtIdService, 'delete').mockResolvedValue(true);

			const result = await authService.logout(jti);

			expect(result).toBe(true);
			expect(jwtIdService.delete).toHaveBeenCalledWith(jti);
		});
	});

	describe('refreshAccessToken', () => {
		it('should return a new access token', async () => {
			const payload: JwtPayloadSecret = {
				userId: 'user-id',
				jti: 'jwt-id-mock',
			};
			const newAccessToken = 'new-access-token';

			jest
				.spyOn(jwtWrapperService, 'refreshAccessToken')
				.mockResolvedValue(newAccessToken);

			const result = await authService.refreshAccessToken(payload);

			expect(result).toEqual({ accessToken: newAccessToken });
			expect(jwtWrapperService.refreshAccessToken).toHaveBeenCalledWith(
				payload,
			);
		});
	});
});
