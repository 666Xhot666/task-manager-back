import { Module } from '@nestjs/common';

import { GithubApiService } from './github-api.service';

@Module({
	providers: [GithubApiService],
})
export class GithubApiModule {}
