import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthorizedJti = createParamDecorator(
	(data: never, ctx: ExecutionContext): string =>
		ctx.switchToHttp().getRequest<{ user: { jti: string } }>().user.jti,
);
