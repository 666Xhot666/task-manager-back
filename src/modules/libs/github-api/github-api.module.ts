import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CacheService } from '../../../core/services/cache.service';

import { GithubApiService } from './github-api.service';

@Module({
	imports: [HttpModule],
	providers: [GithubApiService, CacheService],
	exports: [GithubApiService],
})
export class GithubApiModule {}
