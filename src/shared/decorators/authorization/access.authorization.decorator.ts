import { applyDecorators, UseGuards } from '@nestjs/common';

import { AccessJwtAuthGuard } from '../../guards/jwt-auth/access.jwt-auth.guard';

export const AccessAuthorization = () =>
	applyDecorators(UseGuards(AccessJwtAuthGuard));
