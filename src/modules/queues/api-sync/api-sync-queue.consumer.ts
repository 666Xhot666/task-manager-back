import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { API_SYNC_QUEUE } from '../../../shared/constants/queues/queues.contants';
import { GithubApiService } from '../../libs/github-api/github-api.service';
import { WeatherApiService } from '../../libs/weather-api/weather-api.service';

import { ApiSyncJobData, ApiSyncJobType } from './api-sync-queue.types';

@Processor(API_SYNC_QUEUE)
export class ApiSyncConsumer {
	private readonly logger = new Logger(ApiSyncConsumer.name);

	constructor(
		private readonly githubApiService: GithubApiService,
		private readonly weatherApiService: WeatherApiService,
	) {}

	@Process(ApiSyncJobType.GITHUB_REPOSITORIES)
	async handleGithubRepositoriesSync(job: Job<ApiSyncJobData>) {
		try {
			if (job.data.type !== ApiSyncJobType.GITHUB_REPOSITORIES) {
				throw new Error('Invalid job data type');
			}

			const { userId, searchTitle } = job.data.data;
			this.logger.debug(
				`Processing GitHub repositories sync job ${job.id} for user ${userId}`,
			);

			await this.githubApiService.searchRepositoriesByTitle(searchTitle);
			this.logger.log(
				`Successfully synced GitHub repositories for user ${userId}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to process GitHub repositories sync job ${job.id}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}

	@Process(ApiSyncJobType.WEATHER)
	async handleWeatherSync(job: Job<ApiSyncJobData>) {
		try {
			if (job.data.type !== ApiSyncJobType.WEATHER) {
				throw new Error('Invalid job data type');
			}

			const { userId, city } = job.data.data;
			this.logger.debug(
				`Processing weather sync job ${job.id} for user ${userId}`,
			);

			await this.weatherApiService.getWeather(city);
			this.logger.log(
				`Successfully synced weather data for user ${userId}, city: ${city}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to process weather sync job ${job.id}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}
}
