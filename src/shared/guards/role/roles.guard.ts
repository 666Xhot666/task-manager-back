import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { User, UserRole } from '../../../modules/user/entities/user.entity';
import { ROLES_KEY } from '../../decorators/role/roles.decoratorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<UserRole[]>(
			ROLES_KEY,
			context.getHandler(),
		);
		if (!requiredRoles) return true;

		const { user } = context
			.switchToHttp()
			.getRequest<{ user: { user: User } }>();
		return requiredRoles.some((role) => user.user.role === role);
	}
}
