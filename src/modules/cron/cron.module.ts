import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CacheService } from '../../core/services/cache.service';
import { GithubApiService } from '../libs/github-api/github-api.service';
import { WeatherApiService } from '../libs/weather-api/weather-api.service';

import { GithubTask } from './tasks/github.task.cron';
import { WeatherTask } from './tasks/weather.task.cron';

@Module({
	imports: [HttpModule, ScheduleModule.forRoot()],
	providers: [
		WeatherApiService,
		GithubApiService,
		CacheService,
		WeatherTask,
		GithubTask,
	],
})
export class CronModule {}
