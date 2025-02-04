import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';

import { Project } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
	imports: [TypeOrmModule.forFeature([Project, User])],
	controllers: [ProjectController],
	providers: [ProjectService],
})
export class ProjectModule {}
