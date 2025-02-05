import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { EMAIL_QUEUE } from '../../../shared/constants/queues/queues.contants';

import {
	EmailJobPriority,
	EmailJobType,
	ProjectFinishedEmailData,
	TaskAssignedEmailData,
	TaskCompleteEmailData,
} from './email-queue.types';

@Injectable()
export class EmailQueueProducer {
	private readonly logger = new Logger(EmailQueueProducer.name);

	constructor(@InjectQueue(EMAIL_QUEUE) private queue: Queue) {}

	private getPriorityValue(priority: EmailJobPriority): number {
		switch (priority) {
			case EmailJobPriority.HIGH:
				return 1;
			case EmailJobPriority.MEDIUM:
				return 2;
			case EmailJobPriority.LOW:
				return 3;
			default:
				return 2;
		}
	}

	async addTaskAssignedEmail(
		data: TaskAssignedEmailData,
		priority: EmailJobPriority = EmailJobPriority.HIGH,
	): Promise<void> {
		try {
			await this.queue.add(
				EmailJobType.TASK_ASSIGNED,
				{ type: EmailJobType.TASK_ASSIGNED, data },
				{
					priority: this.getPriorityValue(priority),
					jobId: `task-assigned-${data.taskId}-${Date.now()}`,
				},
			);
			this.logger.log(
				`Added task assigned email job for task ${data.taskId} with priority ${priority}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to add task assigned email job for task ${data.taskId}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}

	async addTaskCompleteEmail(
		data: TaskCompleteEmailData,
		priority: EmailJobPriority = EmailJobPriority.MEDIUM,
	): Promise<void> {
		try {
			await this.queue.add(
				EmailJobType.TASK_COMPLETE,
				{ type: EmailJobType.TASK_COMPLETE, data },
				{
					priority: this.getPriorityValue(priority),
					jobId: `task-complete-${data.taskId}-${Date.now()}`,
				},
			);
			this.logger.log(
				`Added task complete email job for task ${data.taskId} with priority ${priority}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to add task complete email job for task ${data.taskId}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}

	async addProjectFinishedEmail(
		data: ProjectFinishedEmailData,
		priority: EmailJobPriority = EmailJobPriority.HIGH,
	): Promise<void> {
		try {
			await this.queue.add(
				EmailJobType.PROJECT_FINISHED,
				{ type: EmailJobType.PROJECT_FINISHED, data },
				{
					priority: this.getPriorityValue(priority),
					jobId: `project-finished-${data.projectId}-${Date.now()}`,
				},
			);
			this.logger.log(
				`Added project finished email job for project ${data.projectId} with priority ${priority}`,
			);
		} catch (error) {
			this.logger.error(
				`Failed to add project finished email job for project ${data.projectId}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}
}
