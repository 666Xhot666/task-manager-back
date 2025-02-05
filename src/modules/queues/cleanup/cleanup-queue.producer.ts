import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { CLEANUP_QUEUE } from '../../../shared/constants/queues/queues.contants';

import { CleanupJobType, DeleteProjectData } from './cleanup-queue.types';

@Injectable()
export class CleanupQueueProducer {
	private readonly logger = new Logger(CleanupQueueProducer.name);
	private readonly PROJECT_DELETE_DELAY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

	constructor(@InjectQueue(CLEANUP_QUEUE) private queue: Queue) {}

	/**
	 * Schedule a project for deletion after 7 days
	 * @param projectId - ID of the project to delete
	 * @param userId - ID of the user requesting deletion
	 */
	async scheduleProjectDeletion(projectId: string): Promise<void> {
		try {
			const jobData: DeleteProjectData = {
				projectId,
			};

			await this.queue.add(CleanupJobType.DELETE_PROJECT, jobData, {
				delay: this.PROJECT_DELETE_DELAY,
				jobId: `delete-project-${projectId}-${Date.now()}`,
			});

			this.logger.log(`Scheduled project ${projectId} for deletion in 7 days`);
		} catch (error) {
			this.logger.error(
				`Failed to schedule project ${projectId} for deletion`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}

	/**
	 * Cancel scheduled project deletion
	 * @param projectId - ID of the project
	 */
	async cancelProjectDeletion(projectId: number): Promise<void> {
		try {
			const jobs = await this.queue.getJobs(['delayed']);
			const projectJob = jobs.find(
				(job) =>
					job.name === CleanupJobType.DELETE_PROJECT &&
					job.data.projectId === projectId,
			);

			if (projectJob) {
				await projectJob.remove();
				this.logger.log(
					`Cancelled scheduled deletion for project ${projectId}`,
				);
			}
		} catch (error) {
			this.logger.error(
				`Failed to cancel project ${projectId} deletion`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}
}
