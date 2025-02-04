import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
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
	constructor(private mailerService: MailerService) {}

	async sendTaskAssignedMail(to: string, info: TaskCreatedTemplateProps) {
		const html = await render(TaskAssignedTemplate(info));
		await this.sendMail(to, 'Task Assigned', html);
	}
	async sendTaskCompletedMail(to: string, info: TaskCompletedTemplateProps) {
		const html = await render(TaskCompletedTemplate(info));
		await this.sendMail(to, 'Task Completed', html);
	}
	async sendProjectFinishedMail(
		to: string,
		info: ProjectFinishedTemplateProps,
	) {
		const html = await render(ProjectFinishedTemplate(info));
		await this.sendMail(to, 'Project Finished', html);
	}

	private sendMail(to: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to,
			subject,
			html,
		});
	}
}
