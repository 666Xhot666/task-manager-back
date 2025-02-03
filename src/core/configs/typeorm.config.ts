import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

import { JwtId } from '../../modules/auth/jwt-id/entities/jwt-id.entity';
import { User } from '../../modules/user/entities/user.entity';

export function getTypeORMConfig(
	configService: ConfigService,
): TypeOrmModuleOptions {
	return {
		type: configService.getOrThrow<MysqlConnectionOptions['type']>(
			'APPLICATION_DATABASE_PROVIDER',
		),
		host: configService.getOrThrow<string>('MYSQL_HOST'),
		port: configService.getOrThrow<number>('MYSQL_PORT'),
		username: configService.getOrThrow<string>('MYSQL_USER'),
		password: configService.getOrThrow<string>('MYSQL_PASSWORD'),
		database: configService.getOrThrow<string>('MYSQL_DATABASE'),
		entities: [User, JwtId],
		synchronize: true,
		autoLoadEntities: true,
	};
}
