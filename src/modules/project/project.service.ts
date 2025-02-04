import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../user/entities/user.entity';

import { AuditLogProjectService } from './audit-log.project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
	constructor(
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly auditLog: AuditLogProjectService,
	) {}
	/**
	 * Create a new project for the authenticated user.
	 * @param user - The currently authenticated user.
	 * @param createProjectDto - The DTO containing project creation details.
	 * @returns The created project.
	 * @throws ForbiddenException if the user is not allowed to create the project.
	 */
	create(user: User, createProjectDto: CreateProjectDto): Promise<Project> {
		if (createProjectDto.teamId && user.id !== createProjectDto.teamId) {
			throw new ForbiddenException(
				'You are not allowed to create a project for another user',
			);
		}
		return this.createProject({ ...createProjectDto, teamId: user.id });
	}
	/**
	 * Create a new project as an admin.
	 * @param createProjectDto - The DTO containing project creation details.
	 * @returns The created project.
	 * @throws BadRequestException if the teamId is missing.
	 * @throws NotFoundException if the teamHead does not exist.
	 * @throws BadRequestException if the teamHead has invalid role.
	 */
	async createProjectByAdmin(createProjectDto: CreateProjectDto) {
		if (!createProjectDto.teamId) {
			throw new BadRequestException('Team id required for project creation');
		}
		const teamHead = await this.userRepository.findOneBy({
			id: createProjectDto.teamId,
		});
		if (!teamHead) {
			throw new NotFoundException('Team not found');
		}
		if (teamHead.role === UserRole.PERFORMER) {
			throw new BadRequestException(
				'Team does not have permission to perform this project',
			);
		}
		return this.createProject(createProjectDto);
	}

	/**
	 * Retrieve all projects, with optional filtering based on user role and filter criteria.
	 * @param user - The currently authenticated user.
	 * @param filterProjectDTO - The DTO containing filter criteria.
	 * @returns A list of projects filtered based on the user's role and provided filters.
	 */
	findAll(user: User, filterProjectDTO: FilterProjectDto) {
		const query = this.projectRepository.createQueryBuilder('project');

		switch (user.role) {
			case UserRole.MANAGER:
				query.where('project.teamHeadId = :teamId', { teamId: user.id });
				break;
			case UserRole.PERFORMER:
				throw new ForbiddenException('Access forbidden');
		}

		if (filterProjectDTO.title) {
			query.andWhere('LOWER(project.name) LIKE LOWER(:name)', {
				name: `%${filterProjectDTO.title}%`,
			});
		}
		if (filterProjectDTO.status) {
			query.andWhere('LOWER(project.status) LIKE LOWER(:status)', {
				status: `%${filterProjectDTO.status}`,
			});
		}
		if (filterProjectDTO.teamId) {
			if (user.role !== UserRole.ADMIN) {
				throw new ForbiddenException('Filtration by team forbidden');
			}
			query.andWhere('project.teamHeadId = :teamId', {
				teamId: filterProjectDTO.teamId,
			});
		}
		if (filterProjectDTO.sortBy) {
			const validSortFields = Object.keys(Project);
			if (!validSortFields.includes(filterProjectDTO.sortBy)) {
				throw new BadRequestException('Invalid sorting field');
			}
			query.orderBy(
				`project.${filterProjectDTO.sortBy}`,
				filterProjectDTO.order || 'ASC',
			);
		}

		return query.getMany();
	}
	/**
	 * Retrieve a project by its ID.
	 * @param user - The currently authenticated user.
	 * @param id - The ID of the project to retrieve.
	 * @returns The project if found.
	 * @throws NotFoundException if the project is not found or the user has no access.
	 */
	async findOne(user: User, id: number) {
		const query = this.projectRepository.createQueryBuilder('project');
		query.where('project.id = :id', { id: id });
		switch (user.role) {
			case UserRole.MANAGER:
				query.where('project.teamHeadId = :teamId', { teamId: user.id });
				break;
			case UserRole.PERFORMER:
				throw new ForbiddenException('Access forbidden');
		}
		const project = await query.getOne();
		if (!project) {
			throw new NotFoundException(
				'Project not found or insufficient permissions',
			);
		}
		return project;
	}
	/**
	 * Update an existing project.
	 * @param user - The currently authenticated user.
	 * @param id - The ID of the project to update.
	 * @param updateProjectDto - The DTO containing the project update details.
	 * @returns The updated project.
	 * @throws NotFoundException if the project is not found.
	 */
	async update(user: User, id: number, updateProjectDto: UpdateProjectDto) {
		const project = await this.findOne(user, id);
		Object.assign(project, updateProjectDto);
		return this.projectRepository.save(project);
	}
	/**
	 * Delete a project.
	 * @param user - The currently authenticated user.
	 * @param id - The ID of the project to delete.
	 * @returns void
	 * @throws NotFoundException if the project is not found.
	 */
	async remove(user: User, id: number) {
		const project = await this.findOne(user, id);
		await this.projectRepository.remove(project);
		return;
	}

	/**
	 * Private method to create a project record.
	 * @param data - The data to create the project.
	 * @returns The created project.
	 */
	private createProject(data: CreateProjectDto) {
		const project = this.projectRepository.create({
			title: data.title,
			description: data.description,
			status: data.status,
			teamHead: {
				id: data.teamId,
			},
		});
		return this.projectRepository.save(project);
	}
}
