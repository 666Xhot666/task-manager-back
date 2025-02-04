import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';

import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Project } from '../project/entities/project.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Task, User, Project])],
	controllers: [TaskController],
	providers: [TaskService],
})
export class TaskModule {}
