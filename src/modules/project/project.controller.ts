import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';

import { AuthorizedUser } from '../../shared/decorators/authorized/user.authorized.decorator';
import { Roles } from '../../shared/decorators/role/roles.decoratorator';
import { User, UserRole } from '../user/entities/user.entity';

import { CreateProjectDto } from './dto/create-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	/**
	 * Create a new project for the authenticated user.
	 * @param user authorized user.
	 * @param createProjectDto - The DTO containing project creation details.
	 * @returns The created project.
	 * @throws ForbiddenException if the user is not allowed to create a project.
	 */
	@Post()
	@ApiOperation({
		summary:
			"Create a new project for the authenticated user if user access role is Manager.\n Admin creates a new project for a specific team'",
	})
	@ApiBody({ type: CreateProjectDto })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The project has been successfully created.',
		type: Project,
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description:
			'[UserRole.MANAGER] Forbidden: You are not allowed to create a project for another user.',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description:
			'[UserRole.PERFORMER] Forbidden: You are not allowed to create a project.',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'[UserRole.ADMIN] Bad Request: Team id is required for project creation.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description:
			'[UserRole.ADMIN]Not Found: The specified team head does not exist.',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'[UserRole.ADMIN]Bad Request: The team does not have permission to perform this project.',
	})
	create(
		@AuthorizedUser() user: User,
		@Body() createProjectDto: CreateProjectDto,
	) {
		if (user.role === UserRole.ADMIN) {
			return this.projectService.createProjectByAdmin(createProjectDto);
		}
		return this.projectService.create(user, createProjectDto);
	}

	/**
	 * Get all projects with optional filters.
	 * @param user authorized user.
	 * @param filterProjectDto - The optional filter DTO.
	 * @returns A list of projects based on the user role and filters.
	 */
	@Get()
	@ApiOperation({ summary: 'Get all projects with optional filters' })
	@ApiQuery({ type: FilterProjectDto, required: false })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'A list of projects is returned.',
		type: [Project],
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description:
			'[UserRole.PERFORMER] Forbidden: You are not allowed to see the projects.',
	})
	findAll(
		@AuthorizedUser() user: User,
		@Query() filterProjectDto: FilterProjectDto,
	) {
		return this.projectService.findAll(user, filterProjectDto);
	}

	/**
	 * Get a specific project by ID.
	 * @param user authorized user.
	 * @param id - The ID of the project.
	 * @returns The project if found.
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get a project by its ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The project is returned.',
		type: Project,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Project not found or insufficient permissions.',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description:
			'[UserRole.PERFORMER] Forbidden: You are not allowed to see the project.',
	})
	findOne(@AuthorizedUser() user: User, @Param('id') id: number) {
		return this.projectService.findOne(user, id);
	}

	/**
	 * Update an existing project.
	 * @param user authorized user.
	 * @param id - The ID of the project.
	 * @param updateProjectDto - The DTO containing the project update details.
	 * @returns The updated project.
	 * @throws ForbiddenException if the user doesn't have access to the project.
	 */
	@Put(':id')
	@ApiOperation({ summary: 'Update an existing project' })
	@ApiBody({ type: UpdateProjectDto })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The project has been successfully updated.',
		type: Project,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Project not found or insufficient permissions.',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description:
			'[UserRole.PERFORMER] Forbidden: You are not allowed to update the project.',
	})
	update(
		@AuthorizedUser() user: User,
		@Param('id') id: number,
		@Body() updateProjectDto: UpdateProjectDto,
	) {
		return this.projectService.update(user, id, updateProjectDto);
	}

	/**
	 * Delete a project by ID.
	 * @param user authorized user.
	 * @param id - The ID of the project.
	 * @returns void
	 * @throws ForbiddenException if the user doesn't have permission to delete the project.
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a project by ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The project has been successfully deleted.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Project not found or insufficient permissions.',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description:
			'[UserRole.PERFORMER] Forbidden: You are not allowed to delete the project.',
	})
	remove(@AuthorizedUser() user: User, @Param('id') id: number) {
		return this.projectService.remove(user, id);
	}
}
