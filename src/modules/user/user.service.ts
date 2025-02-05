import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';

import { encrypt } from '../../shared/utils/encrypt/encrypt.util';
import { ApiSyncProducer } from '../queues/api-sync/api-sync-queue.producer';
import { ApiSyncJobPriority } from '../queues/api-sync/api-sync-queue.types';

import { AuditLogUserService } from './audit-log.user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly auditLogUserService: AuditLogUserService,
		private readonly apiSyncProducer: ApiSyncProducer,
	) {}
	/**
	 * Creates a new user in the database.
	 *
	 * This method checks if the email already exists, throws a `ConflictException`
	 * if it does, and ensures the role is specified. If successful, the user is
	 * created and saved in the database.
	 *
	 * @param {CreateUserDto} createUserDto - The DTO object containing user data.
	 * @returns {Promise<User>} The created user entity.
	 * @throws {BadRequestException} If the user role is not specified.
	 * @throws {ConflictException} If a user with the same email already exists.
	 * @throws {InternalServerErrorException} If an error occurs while creating the user.
	 */
	async create(createUserDto: CreateUserDto): Promise<User> {
		if (!createUserDto.role) {
			throw new BadRequestException('User role unspecified');
		}
		const existingUser = await this.userRepository.findOneBy({
			email: createUserDto.email,
		});
		if (existingUser) {
			this.logger.warn(
				`User with email ${createUserDto.email} already exists.`,
			);
			throw new ConflictException('Email already in use');
		}

		try {
			const hashedPassword = await encrypt.hash(createUserDto.password);
			const user = this.userRepository.create({
				...createUserDto,
				password: hashedPassword,
			});
			const savedUser = await this.userRepository.save(user);
			await this.apiSyncProducer.scheduleWeatherSync(
				{
					userId: user.id,
					city: user.city,
				},
				ApiSyncJobPriority.LOW,
				true,
			);
			await this.auditLogUserService.logCreate(savedUser, savedUser);
			this.logger.log(
				`User with email ${createUserDto.email} created successfully.`,
			);
			return plainToClass(User, savedUser);
		} catch (error: unknown) {
			this.logger.error(
				'Error creating user',
				error instanceof Error ? error.stack : error,
			);
			throw new InternalServerErrorException('Error creating user');
		}
	}
	/**
	 * Retrieves all users from the database.
	 *
	 * @returns {Promise<User[]>} An array of user entities.
	 * @throws {InternalServerErrorException} If an error occurs while retrieving the users.
	 */
	async findAll(): Promise<User[]> {
		try {
			const users = await this.userRepository.find();
			this.logger.log(`Found ${users.length} users.`);
			return users.map((user) => plainToClass(User, user));
		} catch (error) {
			this.logger.error(
				'Error creating user',
				error instanceof Error ? error.stack : error,
			);
			throw new InternalServerErrorException('Error retrieving users');
		}
	}
	/**
	 * Retrieves a single user by their ID.
	 *
	 * @param {User['id']} id - The ID of the user to retrieve.
	 * @returns {Promise<User>} The user entity.
	 * @throws {NotFoundException} If the user with the given ID is not found.
	 */
	async findOne(id: User['id']): Promise<User> {
		const user = await this.userRepository.findOneBy({ id });
		if (!user) {
			this.logger.warn(`User with id ${id} not found.`);
			throw new NotFoundException(`User with id ${id} not found`);
		}
		this.logger.log(`Found user with id ${id}`);
		return plainToClass(User, user);
	}
	/**
	 * Updates an existing user with the provided data.
	 *
	 * This method first checks if the user exists. If they do, it merges the
	 * provided `updateUserDto` into the existing user and saves the updated user.
	 * @param {User} authorizedUser - authorized user.
	 * @param {User['id']} id - The ID of the user to update.
	 * @param {UpdateUserDto} updateUserDto - The DTO object containing the updated user data.
	 * @returns {Promise<User>} The updated user entity.
	 * @throws {InternalServerErrorException} If an error occurs while updating the user.
	 */
	async update(
		authorizedUser: User,
		id: User['id'],
		updateUserDto: UpdateUserDto,
	): Promise<User> {
		if (
			authorizedUser.role === UserRole.PERFORMER &&
			authorizedUser.id !== id
		) {
			throw new ForbiddenException();
		}
		const user = await this.findOne(id);
		const oldUser = structuredClone(user);
		Object.assign(user, updateUserDto);

		try {
			const updatedUser = await this.userRepository.save(user);
			this.logger.log(`User with id ${id} updated successfully.`);
			await this.auditLogUserService.logUpdate(
				authorizedUser,
				oldUser,
				updatedUser,
			);
			return plainToClass(User, updatedUser);
		} catch (error) {
			this.logger.error(
				'Error updating user',
				error instanceof Error ? error.stack : error,
			);
			throw new InternalServerErrorException('Error updating user');
		}
	}
	/**
	 * Removes a user from the database.
	 *
	 * This method first checks if the user exists, and if they do, deletes the
	 * user from the database.
	 *
	 * @param {User} user - authorized user
	 * @param {User['id']} id - The ID of the user to remove.
	 * @returns {Promise<void>} Void.
	 * @throws {InternalServerErrorException} If an error occurs while removing the user.
	 */
	async remove(user: User, id: User['id']): Promise<void> {
		const targetUser = await this.findOne(id);
		try {
			await this.userRepository.remove(targetUser);
			await this.auditLogUserService.logDelete(user, targetUser);
			this.logger.log(`User with id ${id} removed successfully.`);
		} catch (error) {
			this.logger.error(
				'Error creating user',
				error instanceof Error ? error.stack : error,
			);
			throw new InternalServerErrorException('Error removing user');
		}
	}
}
