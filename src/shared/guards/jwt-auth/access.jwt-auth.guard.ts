import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class AccessJwtAuthGuard extends AuthGuard('jwt') {
	getRequest(context: ExecutionContext): Request {
		return context.switchToHttp().getRequest<Request>();
	}
}
