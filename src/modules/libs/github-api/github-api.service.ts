import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import GithubRepository = github.GithubRepository;
import GithubRepositoryResponse = github.GithubRepositoryResponse;

@Injectable()
export class GithubApiService {
	private readonly logger = new Logger(GithubApiService.name);
	private readonly API_URL: string;

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {
		this.API_URL = this.configService.getOrThrow<string>('GITHUB_API_URL');
	}

	async searchRepositoriesByTitle(title: string): Promise<GithubRepository[]> {
		this.logger.log(`Searching GitHub repositories with title: ${title}`);
		try {
			const response = await firstValueFrom<
				AxiosResponse<GithubRepositoryResponse>
			>(
				this.httpService.get(`${this.API_URL}/search/repositories`, {
					params: { q: title },
				}),
			);

			this.logger.log(
				`Found ${response.data.items.length} repositories for title: ${title}`,
			);
			return response.data.items;
		} catch (error) {
			this.logger.error(
				`Failed to search GitHub repositories for title: ${title}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
			throw new Error('Failed to search GitHub repositories');
		}
	}
}
