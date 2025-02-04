import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ProjectStatus } from '../entities/project.entity';

export class FilterProjectDto {
	@ApiPropertyOptional({
		description: 'Title of the project to filter by',
		example: 'Project Alpha',
	})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({
		description: 'Status of the project to filter by',
		enum: ProjectStatus,
		example: ProjectStatus.ACTIVE,
	})
	@IsOptional()
	@IsEnum(ProjectStatus)
	status?: ProjectStatus;

	@ApiPropertyOptional({
		description: 'Team ID associated with the project to filter by',
		example: 'team-1234',
	})
	@IsOptional()
	@IsString()
	teamId?: string;

	@ApiPropertyOptional({
		description: 'Field to sort by',
		example: 'title',
	})
	@IsOptional()
	@IsString()
	sortBy?: string;

	@ApiPropertyOptional({
		description: 'Sort order (ASC or DESC)',
		enum: ['ASC', 'DESC'],
		default: 'ASC',
		example: 'ASC',
	})
	@IsOptional()
	@IsString()
	order?: 'ASC' | 'DESC';
}
