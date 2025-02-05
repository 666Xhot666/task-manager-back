import { Injectable, LoggerService } from '@nestjs/common';

import { logger } from './logger';

@Injectable()
export class CustomLogger implements LoggerService {
	protected context?: string;

	constructor(context?: string) {
		this.context = context;
	}

	log(message: string, ...meta: any[]) {
		logger.info(message, meta);
	}

	error(message: string, ...meta: any[]) {
		logger.error(message, { context: this.context, meta });
	}

	warn(message: string, ...meta: any[]) {
		logger.warn(message, { context: this.context, meta });
	}

	debug(message: string, ...meta: any[]) {
		logger.debug(message, { context: this.context, meta });
	}

	verbose(message: string, ...meta: any[]) {
		logger.verbose(message, { context: this.context, meta });
	}
}
