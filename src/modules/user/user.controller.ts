import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * Create a new user.
	 * @param {CreateUserDto} createUserDto - The data needed to create a new user.
	 * @returns {User} The created user entity.
	 */
	@Post()
	@ApiOperation({ summary: 'Create a new user' })
	@ApiBody({ type: CreateUserDto })
	@ApiResponse({
		status: 201,
		description: 'User successfully created',
		type: User,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 409, description: 'Conflict: Email already in use' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async create(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.userService.create(createUserDto);
	}

	/**
	 * Retrieve all users.
	 * @returns {User[]} A list of all users.
	 */
	@Get()
	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved all users',
		type: [User],
	})
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async findAll(): Promise<User[]> {
		return this.userService.findAll();
	}

	/**
	 * Retrieve a user by their ID.
	 * @param {string} id - The ID of the user to retrieve.
	 * @returns {User} The user entity.
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get a user by ID' })
	@ApiParam({ name: 'id', type: String, description: 'User ID' })
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved the user',
		type: User,
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async findOne(@Param('id') id: string): Promise<User> {
		return this.userService.findOne(id);
	}

	/**
	 * Update a user by their ID.
	 * @param {string} id - The ID of the user to update.
	 * @param {UpdateUserDto} updateUserDto - The data to update the user with.
	 * @returns {User} The updated user entity.
	 */
	@Patch(':id')
	@ApiOperation({ summary: 'Update a user by ID' })
	@ApiParam({ name: 'id', type: String, description: 'User ID' })
	@ApiBody({ type: UpdateUserDto })
	@ApiResponse({
		status: 200,
		description: 'User successfully updated',
		type: User,
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async update(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<User> {
		return this.userService.update(id, updateUserDto);
	}

	/**
	 * Remove a user by their ID.
	 * @param {string} id - The ID of the user to remove.
	 * @returns {void} No content on success.
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Remove a user by ID' })
	@ApiParam({ name: 'id', type: String, description: 'User ID' })
	@ApiResponse({
		status: 200,
		description: 'User successfully removed',
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async remove(@Param('id') id: string): Promise<void> {
		return this.userService.remove(id);
	}
}
