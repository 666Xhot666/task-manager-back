import { Controller, Get } from '@nestjs/common';
import { register } from 'prom-client';
import { collectDefaultMetrics } from 'prom-client';

@Controller('metrics')
export class MetricsController {
	constructor() {
		// Collect default metrics (CPU, memory, etc.)
		collectDefaultMetrics();
	}

	@Get()
	async getMetrics() {
		return await register.metrics();
	}
}
