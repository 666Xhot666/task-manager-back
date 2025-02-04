import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { GithubApiService } from '../../libs/github-api/github-api.service';

@Injectable()
export class GithubTask {
	private readonly logger = new ConsoleLogger(GithubTask.name);

	constructor(private readonly githubService: GithubApiService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	// @Cron(CronExpression.EVERY_10_SECONDS)
	async updateRepositories() {
		this.logger.log('Updating GitHub repositories...');
		const titles = ['nestjs', 'axios', 'crm', 'task'];
		for (const title of titles) {
			try {
				const repos = await this.githubService.searchRepositoriesByTitle(title);
				const processedRepos = repos.map((repo) => ({
					name: repo.name,
					html_url: repo.html_url,
					owner: { login: repo.owner.login },
				}));
				this.logger.log(
					`Repositories for ${title}: ${JSON.stringify(processedRepos, null, 2)}`,
				);
			} catch (error) {
				this.logger.error(
					`Failed to update repositories for ${title}: ${error instanceof Error ? error.message : 'Ooops'}`,
				);
			}
		}
	}
}
