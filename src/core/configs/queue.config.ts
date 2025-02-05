import { BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

export const getQueueConfig = (
	configService: ConfigService,
): BullModuleOptions => ({
	redis: {
		host: configService.getOrThrow('REDIS_HOST'),
		port: configService.getOrThrow('REDIS_PORT'),
		username: configService.getOrThrow('REDIS_USER'),
		password: configService.getOrThrow('REDIS_PASSWORD'),
	},
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 1000,
		},
		removeOnComplete: true,
		removeOnFail: false,
	},
});
