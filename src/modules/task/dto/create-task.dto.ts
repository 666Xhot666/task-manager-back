import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
	@ApiProperty({
		description: 'The title of the task',
		type: String,
		example: 'Task Title',
	})
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty({
		description: 'The ID of the assignee user',
		type: String,
		example: 'b1e5f62e-e3f8-442b-9f60-d32fa2e2d6f4',
	})
	@IsNotEmpty()
	@IsUUID()
	assigneeId: string;

	@ApiProperty({
		description: 'The current status of the task',
		enum: TaskStatus,
		default: TaskStatus.TO_DO,
		example: TaskStatus.TO_DO,
	})
	@IsNotEmpty()
	@IsEnum(TaskStatus)
	status: TaskStatus;

	@ApiProperty({
		description: 'The deadline for the task',
		type: String,
		format: 'date-time',
		example: '2025-12-31T23:59:59.000Z',
	})
	@IsNotEmpty()
	@IsDate()
	deadline: Date;

	@ApiProperty({
		description: 'The ID of the associated project',
		type: String,
		example: 'fda8e3ad-19c3-467e-b16a-ea4ad372d8bb',
	})
	@IsNotEmpty()
	@IsUUID()
	projectId: string;
}
