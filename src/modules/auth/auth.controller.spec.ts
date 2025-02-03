import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
	let authController: AuthController;
	let authService: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						login: jest.fn(),
						logout: jest.fn(),
						refreshAccessToken: jest.fn(),
					},
				},
			],
		}).compile();

		authController = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
	});

	describe('login', () => {
		it('should return JWT tokens when credentials are valid', async () => {
			const loginDto: LoginDto = {
				email: 'test@test.com',
				password: 'password',
			};

			const tokens = {
				accessToken: 'access-token',
				refreshToken: 'refresh-token',
			};

			jest.spyOn(authService, 'login').mockResolvedValue(tokens);

			const result = await authController.login(loginDto);

			expect(result).toEqual(tokens);
			expect(authService.login).toHaveBeenCalledWith(loginDto);
		});

		it('should throw UnauthorizedException if credentials are invalid', async () => {
			const loginDto: LoginDto = {
				email: 'invalid@test.com',
				password: 'wrong-password',
			};

			jest
				.spyOn(authService, 'login')
				.mockRejectedValue(new UnauthorizedException('Invalid credentials.'));

			await expect(authController.login(loginDto)).rejects.toThrow(
				UnauthorizedException,
			);
		});
	});

	describe('logout', () => {
		it('should successfully log out the user and invalidate the token', async () => {
			const jti = 'jwt-id';

			jest.spyOn(authService, 'logout').mockResolvedValue(true);

			const result = await authController.logout(jti);

			expect(result).toBe(true);
			expect(authService.logout).toHaveBeenCalledWith(jti);
		});

		it('should throw UnauthorizedException if token is invalid', async () => {
			const jti = 'invalid-jwt-id';

			jest
				.spyOn(authService, 'logout')
				.mockRejectedValue(new UnauthorizedException('Invalid token'));

			await expect(authController.logout(jti)).rejects.toThrow(
				UnauthorizedException,
			);
		});
	});

	describe('refreshAccessToken', () => {
		it('should return a new access token', async () => {
			const payload = {
				userId: 'user-id',
				jti: 'jwt-id',
			};

			const newAccessToken = 'new-access-token';

			jest
				.spyOn(authService, 'refreshAccessToken')
				.mockResolvedValue({ accessToken: newAccessToken });

			const result = await authController.refreshAccessToken(
				payload.jti,
				payload.userId,
			);

			expect(result).toEqual({ accessToken: newAccessToken });
			expect(authService.refreshAccessToken).toHaveBeenCalledWith(payload);
		});

		it('should throw UnauthorizedException if the token is invalid', async () => {
			const payload = {
				userId: 'user-id',
				jti: 'invalid-jwt-id',
			};

			jest
				.spyOn(authService, 'refreshAccessToken')
				.mockRejectedValue(new UnauthorizedException('Invalid token'));

			await expect(
				authController.refreshAccessToken(payload.jti, payload.userId),
			).rejects.toThrow(UnauthorizedException);
		});
	});
});
