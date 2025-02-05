import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, ms, prettyPrint } = winston.format;

const nestLikeConsoleFormat = winston.format.printf(
	({ context, level, timestamp, message, ...meta }) => {
		const color = getColorByLogLevel(level);
		const contextMessage = context ? `[${context}] ` : '';
		const customContext = meta[0];
		delete meta[0];
		const metaStr = Object.keys(meta).length
			? JSON.stringify(meta, null, 2)
			: '';

		return `${timestamp} ${color(`[${level.toUpperCase()}]`)} ${color(`[${customContext}]`)} ${contextMessage}	${message} ${metaStr}`;
	},
);

function getColorByLogLevel(level: string): (text: string) => string {
	const colors = {
		error: (text: string) => `\x1b[31m${text}\x1b[0m`, // red
		warn: (text: string) => `\x1b[33m${text}\x1b[0m`, // yellow
		info: (text: string) => `\x1b[32m${text}\x1b[0m`, // green
		verbose: (text: string) => `\x1b[36m${text}\x1b[0m`, // cyan
		debug: (text: string) => `\x1b[34m${text}\x1b[0m`, // blue
	};
	return colors[level] || colors.verbose;
}

export const logger = winston.createLogger({
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		ms(),
		prettyPrint(),
	),
	transports: [
		new winston.transports.Console({
			format: combine(
				timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				ms(),
				nestLikeConsoleFormat,
			),
		}),
		new winston.transports.DailyRotateFile({
			filename: 'logs/error-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			maxFiles: '14d',
			level: 'error',
		}),
		new winston.transports.DailyRotateFile({
			filename: 'logs/combined-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			maxFiles: '14d',
		}),
	],
});
