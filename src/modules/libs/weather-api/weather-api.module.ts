import { Module } from '@nestjs/common';
import { CacheService } from 'src/core/services/cache.service';

import { WeatherApiService } from './weather-api.service';

@Module({
	providers: [WeatherApiService, CacheService],
})
export class WeatherApiModule {}
