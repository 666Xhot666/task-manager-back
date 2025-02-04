import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { TaskStatus } from '../entities/task.entity';

export class TaskFilterDto {
	@ApiPropertyOptional({
		description: 'Filter tasks by title',
		type: String,
		example: 'Task Title',
	})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({
		description: 'Filter tasks by status',
		enum: TaskStatus,
		example: TaskStatus.TO_DO,
	})
	@IsOptional()
	@IsEnum(TaskStatus)
	status?: TaskStatus;

	@ApiPropertyOptional({
		description: 'Filter tasks by project ID',
		type: String,
		example: 'fda8e3ad-19c3-467e-b16a-ea4ad372d8bb',
	})
	@IsOptional()
	@IsUUID()
	projectId?: string;

	@ApiPropertyOptional({
		description: 'Filter tasks by assignee ID',
		type: String,
		example: 'b1e5f62e-e3f8-442b-9f60-d32fa2e2d6f4',
	})
	@IsOptional()
	@IsUUID()
	assigneeId?: string;

	@ApiPropertyOptional({
		description: 'Filter tasks by team ID (only for admins)',
		type: String,
		example: 'b1e5f62e-e3f8-442b-9f60-d32fa2e2d6f4',
	})
	@IsOptional()
	@IsUUID()
	teamId?: string;

	@ApiPropertyOptional({
		description: 'Filter tasks by deadline start date',
		type: String,
		format: 'date-time',
		example: '2025-01-01T00:00:00.000Z',
	})
	@IsOptional()
	@IsDate()
	deadlineFrom?: Date;

	@ApiPropertyOptional({
		description: 'Filter tasks by deadline end date',
		type: String,
		format: 'date-time',
		example: '2025-12-31T23:59:59.000Z',
	})
	@IsOptional()
	@IsDate()
	deadlineTo?: Date;

	@ApiPropertyOptional({
		description: 'Sort tasks by a specific field',
		type: String,
		example: 'deadline',
	})
	@IsOptional()
	@IsString()
	sortBy?: string;

	@ApiPropertyOptional({
		description: 'Order tasks by ascending or descending',
		enum: ['ASC', 'DESC'],
		default: 'ASC',
		example: 'DESC',
	})
	@IsOptional()
	order?: 'ASC' | 'DESC';
}
