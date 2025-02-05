import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';

import { CronModule } from '../modules/cron/cron.module';
import { MailModule } from '../modules/libs/mail/mail.module';
import { ProjectAnalyticsModule } from '../modules/project-analytics/project-analytics.module';
import { ProjectModule } from '../modules/project/project.module';
import { QueueModule } from '../modules/queues/queue.module';
import { TaskModule } from '../modules/task/task.module';
import { UserModule } from '../modules/user/user.module';

import { getCacheConfig } from './configs/cache.config';
import { getQueueConfig } from './configs/queue.config';
import { getTypeORMConfig } from './configs/typeorm.config';
import { CacheService } from './services/cache.service';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getCacheConfig,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getTypeORMConfig,
		}),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getQueueConfig,
		}),
		QueueModule,
		UserModule,
		AuthModule,
		ProjectModule,
		TaskModule,
		CronModule,
		MailModule,
		ProjectAnalyticsModule,
	],
	providers: [CacheService],
})
export class CoreModule {}
