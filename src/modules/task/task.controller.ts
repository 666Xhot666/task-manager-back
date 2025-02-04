import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';

import { AccessAuthorization } from '../../shared/decorators/authorization/access.authorization.decorator';
import { AuthorizedUser } from '../../shared/decorators/authorized/user.authorized.decorator';
import { Roles } from '../../shared/decorators/role/roles.decoratorator';
import { User, UserRole } from '../user/entities/user.entity';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskFilterDto } from './dto/filter-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	/**
	 * Creates a new task.
	 *
	 * @param createTaskDto - Data transfer object containing task creation details.
	 * @param user - authorized user.
	 * @returns The created task.
	 * @throws ForbiddenException if the user role is Performer.
	 * @throws NotFoundException if the project or assignee is not found.
	 */
	@Post()
	@Roles(UserRole.ADMIN, UserRole.MANAGER)
	@ApiOperation({ summary: 'Create a new task' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The task has been successfully created.',
		type: Task,
	})
	@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
	async create(
		@AuthorizedUser() user: User,
		@Body() createTaskDto: CreateTaskDto,
	) {
		return this.taskService.create(user, createTaskDto);
	}

	/**
	 * Retrieves all tasks with filters.
	 *
	 * @param user - authorized user.
	 * @param filters - The filter conditions.
	 * @returns List of tasks that match the filter criteria.
	 */
	@Get()
	@AccessAuthorization()
	@ApiOperation({ summary: 'Retrieve all tasks' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'A list of tasks matching the filters.',
		type: [Task],
	})
	async findAll(@AuthorizedUser() user: User, @Query() filters: TaskFilterDto) {
		return this.taskService.findAll(user, filters);
	}

	/**
	 * Retrieves a specific task by its ID.
	 *
	 * @param user - authorized user.
	 * @param id - The ID of the task.
	 * @returns The task if found, otherwise a 404 error.
	 */
	@Get(':id')
	@AccessAuthorization()
	@ApiOperation({ summary: 'Retrieve a task by ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The task details.',
		type: Task,
	})
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
	async findOne(@AuthorizedUser() user: User, @Param('id') id: number) {
		return this.taskService.findOne(user, id);
	}

	/**
	 * Updates a specific task.
	 *
	 * @param user - authorized user.
	 * @param id - The ID of the task to update.
	 * @param updateTaskDto - The data to update the task.
	 * @returns The updated task.
	 * @throws NotFoundException if the task is not found.
	 */
	@Put(':id')
	@AccessAuthorization()
	@ApiOperation({ summary: 'Update a task' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The task has been successfully updated.',
		type: Task,
	})
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
	async update(
		@AuthorizedUser() user: User,
		@Param('id') id: number,
		@Body() updateTaskDto: UpdateTaskDto,
	) {
		return this.taskService.update(user, id, updateTaskDto);
	}

	/**
	 * Deletes a task by its ID.
	 *
	 * @param user - authorized user.
	 * @param id - The ID of the task to delete.
	 * @returns The deleted task.
	 * @throws ForbiddenException if the user role is Performer.
	 * @throws NotFoundException if the task is not found.
	 */
	@Delete(':id')
	@Roles(UserRole.ADMIN, UserRole.MANAGER)
	@ApiOperation({ summary: 'Delete a task' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The task has been successfully deleted.',
		type: Task,
	})
	@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
	async remove(@AuthorizedUser() user: User, @Param('id') id: number) {
		return this.taskService.remove(user, id);
	}
}
