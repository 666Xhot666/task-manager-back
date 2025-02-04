import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import WeatherData = weather.WeatherData;

@Injectable()
export class WeatherApiService {
	private readonly logger = new ConsoleLogger(WeatherApiService.name);
	private readonly API_KEY: string;
	private readonly API_URL: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {
		this.API_KEY = this.configService.getOrThrow<string>('OPENWEATHER_API_KEY');
		this.API_URL = this.configService.getOrThrow<string>('OPENWEATHER_API_URL');
	}

	async getWeather(location: string): Promise<WeatherData> {
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

			return response.data;
		} catch (error) {
			this.logger.error(
				`Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
			throw new Error('Failed to fetch weather data');
		}
	}
}
