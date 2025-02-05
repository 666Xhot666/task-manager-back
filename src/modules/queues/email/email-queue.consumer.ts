import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';

import { EMAIL_QUEUE } from '../../../shared/constants/queues/queues.contants';
import { MailService } from '../../libs/mail/mail.service';
import { Project } from '../../project/entities/project.entity';

import { EmailJobData, EmailJobType } from './email-queue.types';

@Processor(EMAIL_QUEUE)
export class EmailQueueConsumer {
	private readonly logger = new Logger(EmailQueueConsumer.name);

	constructor(
		private readonly mailService: MailService,
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
	) {}

	@Process(EmailJobType.TASK_ASSIGNED)
	async handleTaskAssignedEmail(job: Job<EmailJobData>) {
		try {
			if (job.data.type !== EmailJobType.TASK_ASSIGNED) {
				throw new Error('Invalid job data type');
			}

			const { to, taskId, data } = job.data.data;

			await this.mailService.sendTaskAssignedMail(to, data);
			this.logger.log(`Sent task assigned email for task ${taskId}`);
		} catch (error) {
			this.logger.error(
				`Failed to process task assigned email job ${job.id}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}

	@Process(EmailJobType.TASK_COMPLETE)
	async handleTaskCompleteEmail(job: Job<EmailJobData>) {
		try {
			if (job.data.type !== EmailJobType.TASK_COMPLETE) {
				throw new Error('Invalid job data type');
			}

			const { taskId, to, data } = job.data.data;

			await this.mailService.sendTaskCompletedMail(to, data);
			this.logger.log(`Sent task complete email for task ${taskId}`);
		} catch (error) {
			this.logger.error(
				`Failed to process task complete email job ${job.id}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}

	@Process(EmailJobType.PROJECT_FINISHED)
	async handleProjectFinishedEmail(job: Job<EmailJobData>) {
		try {
			if (job.data.type !== EmailJobType.PROJECT_FINISHED) {
				throw new Error('Invalid job data type');
			}

			const { projectId } = job.data.data;
			const result = await this.projectRepository
				.createQueryBuilder('project')
				.leftJoinAndSelect('project.teamHead', 'teamHead')
				.leftJoin('project.tasks', 'tasks')
				.leftJoin('tasks.assignee', 'assignee')
				.select(['project.title', 'teamHead.email', 'assignee.email'])
				.where('project.id = :projectId', { projectId })
				.getRawMany<{
					project_title: string;
					teamHead_email: string;
					assignee_email: string;
				}>();

			if (!result.length) return;

			const projectTitle = result[0].project_title;
			const recipientsEmail = [
				...new Set(
					result
						.flatMap((row) => [row.teamHead_email, row.assignee_email])
						.filter(Boolean),
				),
			];
			if (recipientsEmail.length > 0) {
				const promises = recipientsEmail.map((recipientEmail) =>
					this.mailService.sendProjectFinishedMail(projectId, {
						projectName: projectTitle,
						recipientName: recipientEmail,
					}),
				);
				await Promise.allSettled(promises);
			}
			this.logger.log(`Sent project finished email for project ${projectId}`);
		} catch (error) {
			this.logger.error(
				`Failed to process project finished email job ${job.id}`,
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}
}
