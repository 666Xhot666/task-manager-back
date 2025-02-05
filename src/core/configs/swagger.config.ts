import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle('Task Manager')
		.setDescription(
			'Highly loaded backend for project and task management on NestJS.',
		)
		.setVersion('0.1')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
			'JWT',
		)
		.build();
}
