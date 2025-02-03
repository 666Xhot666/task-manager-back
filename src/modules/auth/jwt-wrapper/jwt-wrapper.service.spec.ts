import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import {
	JwtPayload,
	JwtPayloadSecret,
} from '../../../shared/types/jwt-payload.type';
import { JwtIdService } from '../jwt-id/jwt-id.service';

import { JwtWrapperService } from './jwt-wrapper.service';

const mockJwtIdService = {
	create: jest.fn().mockResolvedValue('jwt-id-mock'),
};

const mockJwtService = {
	signAsync: jest.fn(),
};

const mockConfigService = {
	getOrThrow: jest.fn().mockReturnValue('mock-value'),
};

describe('JwtWrapperService', () => {
	let service: JwtWrapperService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				JwtWrapperService,
				{ provide: JwtService, useValue: mockJwtService },
				{ provide: ConfigService, useValue: mockConfigService },
				{ provide: JwtIdService, useValue: mockJwtIdService },
			],
		}).compile();

		service = module.get<JwtWrapperService>(JwtWrapperService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const generateJwtPayload = (userId: string = 'user-id-mock'): JwtPayload => ({
		userId,
	});

	const generateJwtPayloadSecret = (
		userId: string = 'user-id-mock',
		jti: string = 'jwt-id-mock',
	): JwtPayloadSecret => ({
		userId,
		jti,
	});

	describe('generateTokens', () => {
		it('should generate both access and refresh tokens with the correct payload', async () => {
			const payload = generateJwtPayload();
			const tokenMock = 'jwt-token-mock';
			mockJwtService.signAsync.mockResolvedValue(tokenMock);

			const tokens = await service.generateTokens(payload);

			expect(tokens).toHaveProperty('accessToken');
			expect(tokens).toHaveProperty('refreshToken');
			expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
			expect(mockJwtIdService.create).toHaveBeenCalledWith(
				payload.userId,
				'mock-value',
			);
			expect(mockJwtService.signAsync).toHaveBeenCalledWith(
				expect.objectContaining({ jti: 'jwt-id-mock' }),
				expect.objectContaining({ secret: 'mock-value' }),
			);
		});

		it('should throw UnauthorizedException when JwtIdService.create fails', async () => {
			const payload = generateJwtPayload();
			mockJwtIdService.create.mockRejectedValueOnce(
				new UnauthorizedException('Unauthorized'),
			);

			await expect(service.generateTokens(payload)).rejects.toThrowError(
				UnauthorizedException,
			);
		});
	});

	describe('refreshAccessToken', () => {
		it('should refresh the access token using the correct payload', async () => {
			const payload = generateJwtPayloadSecret();
			const tokenMock = 'jwt-access-token-mock';
			mockJwtService.signAsync.mockResolvedValue(tokenMock);

			const token = await service.refreshAccessToken(payload);

			expect(token).toBe(tokenMock);
			expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
				expiresIn: 'mock-value',
				secret: 'mock-value',
			});
		});

		it('should throw error if the signing process fails', async () => {
			const payload = generateJwtPayloadSecret();
			mockJwtService.signAsync.mockRejectedValueOnce(
				new Error('Signing failed'),
			);

			await expect(service.refreshAccessToken(payload)).rejects.toThrowError(
				'Signing failed',
			);
		});
	});
});
