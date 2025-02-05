import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { API_SYNC_QUEUE } from '../../../shared/constants/queues/queues.contants';
import { GithubApiModule } from '../../libs/github-api/github-api.module';
import { WeatherApiModule } from '../../libs/weather-api/weather-api.module';

import { ApiSyncConsumer } from './api-sync-queue.consumer';
import { ApiSyncProducer } from './api-sync-queue.producer';

@Module({
	imports: [
		BullModule.registerQueue({
			name: API_SYNC_QUEUE,
		}),
		GithubApiModule,
		WeatherApiModule,
	],
	providers: [ApiSyncProducer, ApiSyncConsumer],
	exports: [ApiSyncProducer],
})
export class ApiSyncQueueModule {}
