import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthorizedUser } from '../../shared/decorators/authorized/user.authorized.decorator';
import { Roles } from '../../shared/decorators/role/roles.decoratorator';
import { User, UserRole } from '../user/entities/user.entity';

import { AverageCompletionTimeDto } from './dto/average-completion-time.dto';
import { TaskStatusStatsDto } from './dto/task-status-stats.dto';
import { TopUserDto } from './dto/top-users.dto';
import { ProjectAnalyticsService } from './project-analytics.service';

@ApiTags('Project Analytics')
@Controller('analytics/projects/:projectId')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ProjectAnalyticsController {
	constructor(
		private readonly projectAnalyticsService: ProjectAnalyticsService,
	) {}

	/**
	 * Retrieves task status statistics for a given project.
	 *
	 * @param user The authenticated user making the request.
	 * @param projectId The ID of the project for which to fetch task status stats.
	 * @returns The task status statistics for the project.
	 */
	@ApiOperation({ summary: 'Retrieve task status statistics for a project' })
	@ApiParam({
		name: 'projectId',
		description: 'ID of the project to fetch task status stats for',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns task status statistics for the project.',
		type: TaskStatusStatsDto,
	})
	@Get('task-status-stats')
	getTaskStatusStats(
		@AuthorizedUser() user: User,
		@Param('projectId') projectId: string,
	) {
		return this.projectAnalyticsService.getTaskStatusStats(user, projectId);
	}

	/**
	 * Retrieves the average task completion time for a given project.
	 *
	 * @param user The authenticated user making the request.
	 * @param projectId The ID of the project to calculate the average task completion time for.
	 * @returns The average task completion time for the project.
	 */
	@ApiOperation({
		summary: 'Retrieve average task completion time for a project',
	})
	@ApiParam({
		name: 'projectId',
		description:
			'ID of the project to calculate the average task completion time for',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the average task completion time for the project.',
		type: AverageCompletionTimeDto,
	})
	@Get('average-completion-time')
	getAverageCompletionTime(
		@AuthorizedUser() user: User,
		@Param('projectId') projectId: string,
	) {
		return this.projectAnalyticsService.getAverageCompletionTime(
			user,
			projectId,
		);
	}

	/**
	 * Retrieves the top active users for a given project based on task activity.
	 *
	 * @param user The authenticated user making the request.
	 * @param projectId The ID of the project to fetch the top active users for.
	 * @returns The list of top active users for the project.
	 */
	@ApiOperation({ summary: 'Retrieve top active users for a project' })
	@ApiParam({
		name: 'projectId',
		description: 'ID of the project to fetch the top active users for',
	})
	@ApiResponse({
		status: 200,
		description: 'Returns a list of the top active users for the project.',
		type: [TopUserDto],
	})
	@Get('top-active-users')
	getTopActiveUsers(
		@AuthorizedUser() user: User,
		@Param('projectId') projectId: string,
	) {
		return this.projectAnalyticsService.getTopActiveUsers(user, projectId);
	}

	/**
	 * Exports task analytics for a project to a CSV file.
	 *
	 * @param res The response object to stream the CSV file.
	 * @param user The authenticated user making the request.
	 * @param projectId The ID of the project to export task analytics for.
	 * @returns The CSV file containing task analytics for the project.
	 */
	@ApiOperation({ summary: 'Export task analytics to a CSV file' })
	@ApiParam({
		name: 'projectId',
		description: 'ID of the project to export task analytics for',
	})
	@ApiResponse({
		status: 200,
		description:
			'Returns a CSV file containing task analytics for the project.',
	})
	@Header('Access-Control-Allow-Origin', '*')
	@Header('Content-Type', 'text/csv')
	@Header('Content-Disposition', 'attachment; filename="tasks-analytics.csv"')
	@Get('csv')
	async exportcsv(
		@AuthorizedUser() user: User,
		@Param('projectId') projectId: string,
	) {
		return this.projectAnalyticsService.getCSV(user, projectId);
	}
}
