import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';

import { CLEANUP_QUEUE } from '../../../shared/constants/queues/queues.contants';
import { Project } from '../../project/entities/project.entity';
import { Task } from '../../task/entities/task.entity';

import { CleanupJobType, DeleteProjectData } from './cleanup-queue.types';

@Processor(CLEANUP_QUEUE)
export class CleanupQueueConsumer {
	private readonly logger = new Logger(CleanupQueueConsumer.name);

	constructor(
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
	) {}

	@Process(CleanupJobType.DELETE_PROJECT)
	async handleProjectDeletion(job: Job<DeleteProjectData>) {
		try {
			const { projectId } = job.data;
			this.logger.debug(
				`Processing project deletion job ${job.id} for project ${projectId}`,
			);

			await this.taskRepository
				.createQueryBuilder('task')
				.delete()
				.where('projectId = :projectId', { projectId })
				.execute();

			await this.projectRepository
				.createQueryBuilder('project')
				.delete()
				.where('id = :projectId', { projectId })
				.execute();

			this.logger.log(
				`Successfully deleted project ${projectId} and its related tasks`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to process project deletion job ${job.id}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}
}
