import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { CacheService } from '../../../core/services/cache.service';

import WeatherData = weather.WeatherData;

@Injectable()
export class WeatherApiService {
	private readonly logger = new ConsoleLogger(WeatherApiService.name);
	private readonly API_KEY: string;
	private readonly API_URL: string;
	private readonly CACHE_PREFIX = 'weather-api';
	private readonly CACHE_TTL = 60 * 60;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
		private readonly cacheService: CacheService,
	) {
		this.API_KEY = this.configService.getOrThrow<string>('OPENWEATHER_API_KEY');
		this.API_URL = this.configService.getOrThrow<string>('OPENWEATHER_API_URL');
	}

	async getWeather(location: string): Promise<WeatherData> {
		this.logger.log(`Fetching weather data for location: ${location}`);
		const cacheKey = this.cacheService.generateKey(
			this.CACHE_PREFIX,
			location.toString(),
		);
		return this.cacheService.getOrSet(
			cacheKey,
			async () => {
				try {
					const response = await firstValueFrom<AxiosResponse<WeatherData>>(
						this.httpService.get(this.API_URL, {
							params: {
								q: location,
								appid: this.API_KEY,
								units: 'metric',
							},
						}),
					);

					this.logger.log(
						`Successfully fetched weather data for location: ${location}`,
					);
					return response.data;
				} catch (error) {
					this.logger.error(
						`Failed to fetch weather data for location: ${location}. Error: ${
							error instanceof Error ? error.message : 'Unknown error'
						}`,
						error instanceof Error ? error.stack : 'No stack trace available',
					);
					throw new Error('Failed to fetch weather data');
				}
			},
			this.CACHE_TTL,
		);
	}
}
