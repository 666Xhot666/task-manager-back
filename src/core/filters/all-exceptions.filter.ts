import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();

		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		let message: string;
		if (exception instanceof HttpException) {
			const response = exception.getResponse();
			message =
				typeof response === 'string'
					? response
					: (response as any).message || exception.message;
		} else if (exception instanceof QueryFailedError) {
			message = 'Database query failed';
		} else {
			message = 'Internal server error';
		}

		const responseBody = {
			statusCode: httpStatus,
			timestamp: new Date().toISOString(),
			path: httpAdapter.getRequestUrl(ctx.getRequest()),
			message,
		};

		this.logger.error(
			`${responseBody.message} - ${responseBody.path}`,
			exception instanceof Error ? exception.stack : '',
		);

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
