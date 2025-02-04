import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
	@ApiProperty({ example: 'project Apollo' })
	@IsString()
	@IsNotEmpty()
	title: string;
	@ApiProperty({ example: 'destroy the moon' })
	@IsString()
	@IsOptional()
	description: string;
	@ApiProperty({ example: ProjectStatus.ACTIVE })
	@IsEnum(ProjectStatus)
	@IsOptional()
	status: ProjectStatus;
	@ApiProperty({ example: 'd7e4b0f1-9132-4f8d-9f37-d194f72b1f98' })
	@IsString()
	@IsOptional()
	teamId: string;
}
