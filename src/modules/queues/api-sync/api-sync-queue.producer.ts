import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { API_SYNC_QUEUE } from '../../../shared/constants/queues/queues.contants';

import {
	ApiSyncJobPriority,
	ApiSyncJobType,
	GithubSearchData,
	WeatherData,
} from './api-sync-queue.types';

@Injectable()
export class ApiSyncProducer {
	private readonly logger = new Logger(ApiSyncProducer.name);
	private readonly SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes

	constructor(@InjectQueue(API_SYNC_QUEUE) private queue: Queue) {}

	async scheduleGithubRepositoriesSync(
		data: GithubSearchData,
		priority: ApiSyncJobPriority = ApiSyncJobPriority.LOW,
		repeat = false,
	): Promise<void> {
		try {
			const jobOptions = {
				priority: priority,
				jobId: `github-repos-sync-${data.userId}-${Date.now()}`,
				...(repeat && {
					repeat: {
						every: this.SYNC_INTERVAL,
					},
				}),
			};

			await this.queue.add(
				ApiSyncJobType.GITHUB_REPOSITORIES,
				{ type: ApiSyncJobType.GITHUB_REPOSITORIES, data },
				jobOptions,
			);

			this.logger.log(
				`Scheduled GitHub repositories sync for user ${data.userId}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to schedule GitHub repositories sync for user ${data.userId}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}

	async scheduleWeatherSync(
		data: WeatherData,
		priority: ApiSyncJobPriority = ApiSyncJobPriority.MEDIUM,
		repeat = false,
	): Promise<void> {
		try {
			const jobOptions = {
				priority: priority,
				jobId: `weather-sync-${data.userId}-${Date.now()}`,
				...(repeat && {
					repeat: {
						every: this.SYNC_INTERVAL,
					},
				}),
			};

			await this.queue.add(
				ApiSyncJobType.WEATHER,
				{ type: ApiSyncJobType.WEATHER, data },
				jobOptions,
			);

			this.logger.log(
				`Scheduled weather sync for user ${data.userId}, city: ${data.city}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to schedule weather sync for user ${data.userId}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}

	async removeUserSyncJobs(userId: number): Promise<void> {
		try {
			const jobs = await this.queue.getJobs(['active', 'waiting', 'delayed']);
			const userJobs = jobs.filter(
				(job) =>
					(job.data.type === ApiSyncJobType.GITHUB_REPOSITORIES ||
						job.data.type === ApiSyncJobType.WEATHER) &&
					job.data.data.userId === userId,
			);

			await Promise.all(userJobs.map((job) => job.remove()));
			this.logger.log(`Removed all sync jobs for user ${userId}`);
		} catch (error) {
			this.logger.error(
				`Failed to remove sync jobs for user ${userId}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}
}
