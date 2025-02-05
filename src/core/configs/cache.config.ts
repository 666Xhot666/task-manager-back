import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

export const getCacheConfig = (
	configService: ConfigService,
): CacheModuleOptions => {
	const options = {
		host: configService.getOrThrow<string>('REDIS_HOST'),
		port: configService.getOrThrow<number>('REDIS_PORT'),
		ttl: configService.getOrThrow<number>('REDIS_TTL'),
		max: configService.getOrThrow<number>('REDIS_MAX_ITEMS'),
		password: configService.getOrThrow<string>('REDIS_PASSWORD'),
		user: configService.getOrThrow<string>('REDIS_USER'),
	};
	return {
		stores: [
			new Keyv(
				new KeyvRedis(
					`redis://${options.user}:${options.password}@${options.host}:${options.port}`,
				),
			),
		],
		ttl: options.ttl,
		max: options.max,
	};
};
