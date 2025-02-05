import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from '../project/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { User } from '../user/entities/user.entity';

import { ProjectAnalyticsController } from './project-analytics.controller';
import { ProjectAnalyticsService } from './project-analytics.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, Project, Task])],
	controllers: [ProjectAnalyticsController],
	providers: [ProjectAnalyticsService],
})
export class ProjectAnalyticsModule {}
