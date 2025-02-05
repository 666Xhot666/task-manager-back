import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { CoreModule } from './core/core.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { setupSwagger } from './core/swagger/swagger.setup';

async function bootstrap() {
	const app = await NestFactory.create(CoreModule);

	app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

	setupSwagger(app);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
