import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessAuthorization } from '../../shared/decorators/authorization/access.authorization.decorator';
import { RefreshAuthorization } from '../../shared/decorators/authorization/refresh.authorization.decorator';
import { AuthorizedJti } from '../../shared/decorators/authorized/jti.authorized.decorator';
import { AuthorizedUser } from '../../shared/decorators/authorized/user.authorized.decorator';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Logs the user in by validating credentials and returning JWT tokens.
	 * @param loginDto - Contains user email and password for authentication.
	 * @returns JWT tokens for the authenticated user.
	 * @throws UnauthorizedException - If the credentials are invalid.
	 * @throws InternalServerException - If a server exception occurs.
	 */
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login and return JWT tokens' })
	@ApiBody({ type: LoginDto })
	@ApiResponse({
		status: 200,
		description: 'Successfully logged in, returns JWT tokens.',
		schema: {
			example: {
				accessToken: 'string',
				refreshToken: 'string',
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid credentials.',
	})
	@ApiResponse({
		status: 500,
		description: 'Internal server error occurred while logging out.',
	})
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	/**
	 * Logs out the user by invalidating their JWT token (via JTI deletion).
	 * @param jti - The JWT ID to be deleted, invalidating the token.
	 * @returns A success message indicating the logout process was completed.
	 * @throws UnauthorizedException - If the token are invalid.
	 * @throws InternalServerException - If a server exception occurs.
	 */
	@Post('logout')
	@ApiOperation({ summary: 'Logout and invalidate JWT token' })
	@ApiResponse({
		status: 200,
		description: 'Successfully logged out and JWT token invalidated.',
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: 500,
		description: 'Internal server error occurred while logging out.',
	})
	@ApiBearerAuth()
	@HttpCode(HttpStatus.OK)
	@AccessAuthorization()
	async logout(@AuthorizedJti() jti: string) {
		return this.authService.logout(jti);
	}

	/**
	 * Refreshes the access token for the authenticated user.
	 * @param jti - JWT ID for the current session (used for invalidating the old token).
	 * @param userId - The user's unique ID (to link the refreshed token to the user).
	 * @returns A new access token for the user.
	 * @throws UnauthorizedException - If the token are invalid.
	 * @throws InternalServerException - If a server exception occurs.
	 */
	@Post('refresh')
	@ApiOperation({
		summary: 'Refresh the access token for the authenticated user',
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully refreshed the access token.',
		schema: {
			example: {
				accessToken: 'string',
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid token',
	})
	@ApiResponse({
		status: 500,
		description: 'Internal server error occurred while logging out.',
	})
	@ApiBearerAuth()
	@HttpCode(HttpStatus.OK)
	@RefreshAuthorization()
	async refreshAccessToken(
		@AuthorizedJti() jti: string,
		@AuthorizedUser('id') userId: string,
	) {
		return this.authService.refreshAccessToken({ userId, jti });
	}
}
