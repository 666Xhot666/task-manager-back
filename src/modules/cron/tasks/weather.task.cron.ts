import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { WeatherApiService } from '../../libs/weather-api/weather-api.service';

@Injectable()
export class WeatherTask {
	private readonly logger = new Logger(WeatherTask.name);

	constructor(private readonly weatherService: WeatherApiService) {}

	@Cron(CronExpression.EVERY_HOUR)
	// @Cron(CronExpression.EVERY_10_SECONDS)
	async updateWeatherData() {
		this.logger.log('Updating weather data...');

		const locations = ['Kyiv', 'Lviv', 'Odessa'];
		for (const location of locations) {
			try {
				const weatherData = await this.weatherService.getWeather(location);
				this.logger.log('Weather data', weatherData);
				this.logger.log(`Weather in ${location}: ${weatherData.main.temp}°C`);
			} catch (error) {
				this.logger.error(
					`Failed to update weather for ${location}: ${error instanceof Error ? error.message : 'Ooops'}`,
				);
			}
		}
	}
}
