import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { CoreModule } from './core/core.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { CustomLogger } from './core/logger/logger.service';
import { setupSwagger } from './core/swagger/swagger.setup';

async function bootstrap() {
	const app = await NestFactory.create(CoreModule, {
		logger: new CustomLogger(),
	});

	app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

	setupSwagger(app);

	await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
	console.error('Failed to start application:', error);
	process.exit(1);
});
