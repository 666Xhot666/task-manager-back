import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { CacheService } from '../../../core/services/cache.service';

import GithubRepository = github.GithubRepository;
import GithubRepositoryResponse = github.GithubRepositoryResponse;

@Injectable()
export class GithubApiService {
	private readonly logger = new Logger(GithubApiService.name);
	private readonly API_URL: string;
	private readonly CACHE_TTL = 3000;
	private readonly CACHE_PREFIX = 'github_api';

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
		private readonly cacheService: CacheService,
	) {
		this.API_URL = this.configService.getOrThrow<string>('GITHUB_API_URL');
	}

	async searchRepositoriesByTitle(title: string): Promise<GithubRepository[]> {
		const cacheKey = this.cacheService.generateKey(
			this.CACHE_PREFIX,
			title.toString(),
		);
		this.logger.log(`Searching GitHub repositories with title: ${title}`);
		try {
			return this.cacheService.getOrSet(
				cacheKey,
				async () => {
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
				},
				this.CACHE_TTL,
			);
		} catch (error) {
			this.logger.error(
				`Failed to search GitHub repositories for title: ${title}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				error instanceof Error ? error.stack : 'No stack trace available',
			);
			throw new Error('Failed to search GitHub repositories');
		}
	}
}
