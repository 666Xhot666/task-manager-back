import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { getSwaggerConfig } from '../configs/swagger.config';

export function setupSwagger(app: INestApplication) {
	const config = getSwaggerConfig();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, documentFactory);
}
