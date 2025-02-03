import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('jwt-refresh') {
	getRequest(context: ExecutionContext): Request {
		return context.switchToHttp().getRequest<Request>();
	}
}
