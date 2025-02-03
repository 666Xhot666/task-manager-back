import { NestFactory } from '@nestjs/core';

import { CoreModule } from './core/core.module';
import { setupSwagger } from './core/swagger/swagger.setup';

async function bootstrap() {
	const app = await NestFactory.create(CoreModule);

	setupSwagger(app);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
