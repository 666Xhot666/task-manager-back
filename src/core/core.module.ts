import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';

import { CronModule } from '../modules/cron/cron.module';
import { ProjectModule } from '../modules/project/project.module';
import { TaskModule } from '../modules/task/task.module';
import { UserModule } from '../modules/user/user.module';

import { getTypeORMConfig } from './configs/typeorm.config';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getTypeORMConfig,
		}),
		UserModule,
		AuthModule,
		ProjectModule,
		TaskModule,
		CronModule,
	],
})
export class CoreModule {}
