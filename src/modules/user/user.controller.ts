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

import { AccessAuthorization } from '../../shared/decorators/authorization/access.authorization.decorator';
import { AuthorizedUser } from '../../shared/decorators/authorized/user.authorized.decorator';
import { Roles } from '../../shared/decorators/role/roles.decoratorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
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
	 *
	 * This endpoint returns a list of all users. The response can be filtered based on the user's role.
	 * For example, a `PERFORMER` user will only retrieve their own details.
	 *
	 * @param {UserRole} role - The role of the requesting user, which will determine the access level.
	 * @param {string} userId - The ID of the requesting user, used to limit access to personal data for non-admin roles.
	 * @returns {User[]} A list of users.
	 */
	@Get()
	@ApiOperation({
		summary: 'Get all users',
		description:
			"This endpoint returns a list of all users. The response can be filtered based on the user's role.\n	 * For example, a `PERFORMER` user will only retrieve their own details.",
	})
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved all users',
		type: [User],
	})
	@ApiResponse({ status: 500, description: 'Internal server error' })
	@AccessAuthorization()
	async findAll(
		@AuthorizedUser('role') role: User['role'],
		@AuthorizedUser('id') userId: User['id'],
	): Promise<User[]> {
		if (role === UserRole.PERFORMER) {
			return [await this.userService.findOne(userId)];
		}
		return this.userService.findAll();
	}

	/**
	 * Retrieve a specific user by their ID.
	 *
	 * This endpoint allows you to retrieve a user by their unique ID. Access is restricted based on the user's role.
	 * For example, performers can only retrieve their own details.
	 *
	 * @param {UserRole} role - Role of the current user requesting the data.
	 * @param {string} userId - ID of the currently logged-in user, used for role-based filtering.
	 * @param {string} id - The ID of the user being retrieved.
	 * @returns {User} The user entity corresponding to the provided ID.
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
	@AccessAuthorization()
	async findOne(
		@AuthorizedUser('role') role: User['role'],
		@AuthorizedUser('id') userId: User['id'],
		@Param('id') id: string,
	): Promise<User> {
		return this.userService.findOne(role === UserRole.PERFORMER ? userId : id);
	}

	/**
	 * Update an existing user.
	 *
	 * This endpoint allows updating a user's details. Access is restricted by the user's role.
	 * A `PERFORMER` can only update their own data.
	 *
	 * @param {User} user - authorized user
	 * @param {string} id - The ID of the user whose data is to be updated.
	 * @param {UpdateUserDto} updateUserDto - DTO containing the updated user data.
	 * @returns {User} The updated user entity.
	 * @throws {ForbiddenException} Forbidden if a user attempts to update another user’s data without proper permissions.
	 * @throws {NotFoundException} User not found if the requested user to update does not exist.
	 * @throws {InternalServerException} Internal server error if an unexpected error occurs.
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
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	@AccessAuthorization()
	async update(
		@AuthorizedUser() user: User,
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<User> {
		return this.userService.update(user, id, updateUserDto);
	}

	/**
	 * Remove a user by their ID.
	 *
	 * This endpoint allows removing a user from the system. Only accessible by users with `ADMIN` or `PERFORMER` roles.
	 *
	 * @param {User} user - authorized user.
	 * @param {string} id - The ID of the user to be deleted.
	 * @returns {void} No content if the deletion is successful.
	 * @throws {ForbiddenException} Forbidden if the user does not have the required permissions to delete the user.
	 * @throws {InternalServerException} Internal server error if an unexpected error occurs.
	 */
	@Delete(':id')
	@Roles(UserRole.ADMIN, UserRole.PERFORMER)
	@ApiOperation({ summary: 'Remove a user by ID' })
	@ApiParam({ name: 'id', type: String, description: 'User ID' })
	@ApiResponse({
		status: 200,
		description: 'User successfully removed',
	})
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async remove(
		@AuthorizedUser() user: User,
		@Param('id') id: string,
	): Promise<void> {
		return this.userService.remove(user, id);
	}
}
