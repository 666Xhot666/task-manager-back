import { applyDecorators, UseGuards } from '@nestjs/common';

import { RefreshJwtAuthGuard } from '../../guards/jwt-auth/refresh.jwt-auth.guard';

export const RefreshAuthorization = () =>
	applyDecorators(UseGuards(RefreshJwtAuthGuard));
