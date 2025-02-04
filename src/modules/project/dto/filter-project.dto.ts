import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ProjectStatus } from '../entities/project.entity';

export class FilterProjectDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsEnum(ProjectStatus)
	status?: ProjectStatus;

	@IsOptional()
	@IsString()
	teamId?: string;

	@IsOptional()
	@IsString()
	sortBy?: string;

	@IsOptional()
	@IsString()
	order?: 'ASC' | 'DESC';
}
