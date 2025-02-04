import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { UserRole } from '../../../modules/user/entities/user.entity';
import { RolesGuard } from '../../guards/role/roles.guard';
import { AccessAuthorization } from '../authorization/access.authorization.decorator';

export const ROLES_KEY = Symbol('roles');
export const Roles = (...roles: UserRole[]) =>
	applyDecorators(
		AccessAuthorization(),
		SetMetadata(ROLES_KEY, roles),
		UseGuards(RolesGuard),
	);
