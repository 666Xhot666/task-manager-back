import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/components';

import {
	ProjectFinishedTemplate,
	ProjectFinishedTemplateProps,
} from './templates/project-finished.template';
import TaskAssignedTemplate, {
	TaskCreatedTemplateProps,
} from './templates/task-assigned.template';
import TaskCompletedTemplate, {
	TaskCompletedTemplateProps,
} from './templates/task-complete.template';

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);

	constructor(private mailerService: MailerService) {}

	async sendTaskAssignedMail(to: string, info: TaskCreatedTemplateProps) {
		this.logger.log(`Sending task assigned email to: ${to}`);
		try {
			const html = await render(TaskAssignedTemplate(info));
			await this.sendMail(to, 'Task Assigned', html);
			this.logger.log(`Task assigned email successfully sent to: ${to}`);
		} catch (error) {
			this.logger.error(
				`Failed to send task assigned email to: ${to}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
		}
	}

	async sendTaskCompletedMail(to: string, info: TaskCompletedTemplateProps) {
		this.logger.log(`Sending task completed email to: ${to}`);
		try {
			const html = await render(TaskCompletedTemplate(info));
			await this.sendMail(to, 'Task Completed', html);
			this.logger.log(`Task completed email successfully sent to: ${to}`);
		} catch (error) {
			this.logger.error(
				`Failed to send task completed email to: ${to}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
		}
	}

	async sendProjectFinishedMail(
		to: string,
		info: ProjectFinishedTemplateProps,
	) {
		this.logger.log(`Sending project finished email to: ${to}`);
		try {
			const html = await render(ProjectFinishedTemplate(info));
			await this.sendMail(to, 'Project Finished', html);
			this.logger.log(`Project finished email successfully sent to: ${to}`);
		} catch (error) {
			this.logger.error(
				`Failed to send project finished email to: ${to}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
		}
	}

	private async sendMail(to: string, subject: string, html: string) {
		this.logger.log(
			`Attempting to send email to: ${to} with subject: ${subject}`,
		);
		try {
			await this.mailerService.sendMail({
				to,
				subject,
				html,
			});
			this.logger.log(`Email successfully sent to: ${to}`);
		} catch (error) {
			this.logger.error(
				`Failed to send email to: ${to} with subject: ${subject}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
			throw error;
		}
	}
}
