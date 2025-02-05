import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CacheService } from '../../../core/services/cache.service';

import { WeatherApiService } from './weather-api.service';

@Module({
	imports: [HttpModule],
	providers: [WeatherApiService, CacheService],
	exports: [WeatherApiService],
})
export class WeatherApiModule {}
