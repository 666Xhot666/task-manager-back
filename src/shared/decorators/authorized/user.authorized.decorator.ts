import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '../../../modules/user/entities/user.entity';

export const AuthorizedUser = createParamDecorator(
	(data: keyof User, ctx: ExecutionContext): User | User[keyof User] => {
		const user = ctx.switchToHttp().getRequest<{ user: { user: User } }>()
			.user.user;
		return data ? user[data] : user;
	},
);
