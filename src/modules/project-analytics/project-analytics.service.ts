import {
	Injectable,
	Logger,
	NotFoundException,
	StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import * as fastCsv from 'fast-csv';
import { Repository } from 'typeorm';

import { Project } from '../project/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { User, UserRole } from '../user/entities/user.entity';

import { AverageCompletionTimeDto } from './dto/average-completion-time.dto';
import { TaskStatusStatsDto } from './dto/task-status-stats.dto';
import { TopUserDto } from './dto/top-users.dto';
import { CsvTask } from './types/csv.type';

@Injectable()
export class ProjectAnalyticsService {
	private readonly logger = new Logger(ProjectAnalyticsService.name);

	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
	) {}

	/**
	 * Returns task status statistics for the specified project.
	 * @param user The user requesting the data.
	 * @param projectId The project ID to fetch data for.
	 * @returns Task status stats for the project.
	 */
	async getTaskStatusStats(
		user: User,
		projectId: number,
	): Promise<TaskStatusStatsDto> {
		await this.validateProjectExistence(user, projectId);

		const query = this.taskRepository
			.createQueryBuilder('task')
			.select('task.status', 'status')
			.addSelect('COUNT(task.id)', 'count')
			.where('task.projectId = :projectId', { projectId })
			.groupBy('task.status');

		this.logger.debug(
			`Generated Query for getTaskStatusStats: projectId:${projectId} ::  query: ${query.getQuery()}`,
		);
		const result = await query.getRawMany<Record<string, string>>();

		return {
			stats: result.reduce(
				(
					acc: Record<string, number>,
					{ status, count },
				): Record<string, number> => {
					acc[status] = parseInt(count);
					return acc;
				},
				{},
			),
		};
	}

	/**
	 * Returns the average completion time for tasks in the specified project.
	 * @param user The user requesting the data.
	 * @param projectId The project ID to fetch data for.
	 * @returns The average completion time in a human-readable format.
	 */
	async getAverageCompletionTime(
		user: User,
		projectId: number,
	): Promise<AverageCompletionTimeDto> {
		await this.validateProjectExistence(user, projectId);

		const query = this.taskRepository
			.createQueryBuilder('task')
			.select(
				'AVG(EXTRACT(EPOCH FROM (task.completedAt - task.createdAt)))',
				'avgTime',
			)
			.where('task.projectId = :projectId', { projectId })
			.andWhere('task.status = :status', { status: 'Done' });

		this.logger.debug(
			`Generated Query for getAverageCompletionTime: projectId:${projectId} ::  query: ${query.getQuery()}`,
		);
		const result = await query.getRawOne<{ avgTime: string }>();

		const seconds = parseFloat(result?.avgTime || '0');
		return {
			averageTime: this.formatDuration(seconds),
		};
	}

	/**
	 * Returns the top 3 active users for a project based on completed tasks.
	 * @param user The user requesting the data.
	 * @param projectId The project ID to fetch data for.
	 * @returns List of top users based on task completion.
	 */
	async getTopActiveUsers(
		user: User,
		projectId: number,
	): Promise<TopUserDto[]> {
		await this.validateProjectExistence(user, projectId);

		const query = this.userRepository
			.createQueryBuilder('user')
			.select(['user.email', 'COUNT(task.id) as completedTasks'])
			.innerJoin('user.tasks', 'task', 'task.projectId = :projectId', {
				projectId,
			})
			.where('task.status = :status', { status: 'Done' })
			.groupBy('user.id')
			.orderBy('completedTasks', 'DESC')
			.limit(3);

		this.logger.debug(
			`Generated Query for getTopActiveUsers: projectId:${projectId} ::  query: ${query.getQuery()}`,
		);
		return await query.getRawMany();
	}

	/**
	 * Generates a CSV file of tasks and streams it to the client.
	 * @param res The response object to stream the file.
	 * @param user The user requesting the file.
	 * @param projectId The project ID to fetch data for.
	 * @returns A StreamableFile containing the CSV data.
	 */
	async getCSV(user: User, projectId: number) {
		await this.validateProjectExistence(user, projectId);

		const query = this.taskRepository
			.createQueryBuilder('task')
			.select(
				'task.id,task.title, task.status, task.deadline, project.title as projectTitle, user.email as userEmail',
			)
			.leftJoin('task.assignee', 'user')
			.innerJoin('task.project', 'project')
			.where('task.projectId = :projectId', { projectId })
			.orderBy('task.deadline', 'ASC');

		this.logger.debug(
			`Generated Query for getCSV: projectId:${projectId} :: query:  ${query.getQuery()}`,
		);
		const tasks = await query.getRawMany<CsvTask>();

		const csvStream = fastCsv.format({ headers: true, writeHeaders: true });
		tasks.forEach((task) => {
			csvStream.write(task);
		});
		csvStream.end();
		return new StreamableFile(csvStream);
	}

	/**
	 * Validates that the project exists and the user has access to it.
	 * @param user The user requesting the validation.
	 * @param projectId The project ID to validate.
	 * @returns True if the project exists and the user has access.
	 * @throws NotFoundException if the project doesn't exist or the user doesn't have access.
	 */
	private async validateProjectExistence(
		user: User,
		projectId: number,
	): Promise<boolean> {
		const query = this.projectRepository.createQueryBuilder('project');
		query.where('project.id = :projectId', { projectId });
		if (user.role === UserRole.MANAGER) {
			query.andWhere('project.teamHeadId = : teamHeadId', {
				teamHeadId: user.id,
			});
		}

		this.logger.debug(
			`Generated Query validateProjectExistence: projectId:${projectId}; user.id: ${user.id}; role: ${user.role} :: query: ${query.getQuery()}`,
		);
		const project = await query.getOne();
		if (!project) {
			this.logger.warn(`Project with ID ${projectId} not found or no access.`);
			throw new NotFoundException('Project not found');
		}
		return true;
	}

	/**
	 * Converts seconds to a human-readable duration (e.g., "2d 3h 15m").
	 * @param seconds The number of seconds to convert.
	 * @returns A string representing the duration.
	 */
	private formatDuration(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${days}d ${hours}h ${minutes}m`;
	}
}
