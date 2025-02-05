import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
	) {}
	async getTaskStatusStats(
		user: User,
		projectId: number,
	): Promise<TaskStatusStatsDto> {
		await this.validateProjectExistence(user, projectId);

		const result = await this.taskRepository
			.createQueryBuilder('task')
			.select('task.status', 'status')
			.addSelect('COUNT(task.id)', 'count')
			.where('task.projectId = :projectId', { projectId })
			.groupBy('task.status')
			.getRawMany<Record<string, string>>();

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

	async getAverageCompletionTime(
		user: User,
		projectId: number,
	): Promise<AverageCompletionTimeDto> {
		await this.validateProjectExistence(user, projectId);
		const result = await this.taskRepository
			.createQueryBuilder('task')
			.select(
				'AVG(EXTRACT(EPOCH FROM (task.completedAt - task.createdAt)))',
				'avgTime',
			)
			.where('task.projectId = :projectId', { projectId })
			.andWhere('task.status = :status', { status: 'Done' })
			.getRawOne<{ avgTime: string }>();

		const seconds = parseFloat(result?.avgTime || '0');
		return {
			averageTime: this.formatDuration(seconds),
		};
	}

	async getTopActiveUsers(
		user: User,
		projectId: number,
	): Promise<TopUserDto[]> {
		await this.validateProjectExistence(user, projectId);
		return this.userRepository
			.createQueryBuilder('user')
			.select(['user.email', 'COUNT(task.id) as completedTasks'])
			.innerJoin('user.tasks', 'task', 'task.projectId = :projectId', {
				projectId,
			})
			.where('task.status = :status', { status: 'Done' })
			.groupBy('user.id')
			.orderBy('completedTasks', 'DESC')
			.limit(3)
			.getRawMany();
	}
	async getCSV(res: Response, user: User, projectId: number) {
		await this.validateProjectExistence(user, projectId);
		const tasks = await this.taskRepository
			.createQueryBuilder('task')
			.select(
				'task.id,task.title, task.status, task.deadline, project.title as projectTitle, user.email as userEmail',
			)
			.leftJoin('task.assignee', 'user')
			.innerJoin('task.project', 'project')
			.where('task.projectId = :projectId', { projectId })
			.orderBy('task.deadline', 'ASC')
			.getRawMany<CsvTask>();
		const csvStream = fastCsv.format({ headers: true, writeHeaders: true });
		tasks.forEach((task) => {
			csvStream.write(task);
		});
		csvStream.end();
		return new StreamableFile(csvStream);
	}
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
		const project = await query.getOne();
		if (!project) {
			throw new NotFoundException('Project not found');
		}
		return true;
	}

	private formatDuration(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${days}d ${hours}h ${minutes}m`;
	}
}
