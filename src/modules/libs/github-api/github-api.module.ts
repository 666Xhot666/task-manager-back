import { Module } from '@nestjs/common';

import { CacheService } from '../../../core/services/cache.service';

import { GithubApiService } from './github-api.service';

@Module({
	providers: [GithubApiService, CacheService],
})
export class GithubApiModule {}
