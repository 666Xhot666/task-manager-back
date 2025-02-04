import { Module } from '@nestjs/common';

import { WeatherApiService } from './weather-api.service';

@Module({
	providers: [WeatherApiService],
})
export class WeatherApiModule {}
