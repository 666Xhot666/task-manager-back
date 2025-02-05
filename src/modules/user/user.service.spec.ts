import {
	BadRequestException,
	ConflictException,
	ConsoleLogger,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as crypto from 'node:crypto';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
	let service: UserService;
	let userRepository: Repository<User>;
	let logger: ConsoleLogger;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: getRepositoryToken(User),
					useValue: {
						find: jest.fn(),
						findOneBy: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						remove: jest.fn(),
					},
				},
				{
					provide: ConsoleLogger,
					useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		userRepository = module.get<Repository<User>>(getRepositoryToken(User));
		logger = module.get<ConsoleLogger>(ConsoleLogger);
	});

	describe('create', () => {
		it('should throw BadRequestException if role is unspecified', async () => {
			const createUserDto: CreateUserDto = {
				email: 'test@example.com',
				password: 'password123',
				//@ts-expect-error role is unspecified
				role: undefined,
			};

			await expect(service.create(createUserDto)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should throw ConflictException if email already exists', async () => {
			const createUserDto: CreateUserDto = {
				email: 'test@example.com',
				password: 'password123',
				role: UserRole.PERFORMER,
			};
			const existingUser = new User();
			existingUser.email = 'test@example.com';
			userRepository.findOneBy = jest.fn().mockResolvedValue(existingUser);

			await expect(service.create(createUserDto)).rejects.toThrow(
				ConflictException,
			);
		});

		it('should create a new user successfully', async () => {
			const createUserDto: CreateUserDto = {
				email: 'test@example.com',
				password: 'password123',
				role: UserRole.PERFORMER,
			};
			const newUser = new User();
			newUser.email = 'test@example.com';
			newUser.role = UserRole.PERFORMER;

			userRepository.findOneBy = jest.fn().mockResolvedValue(null);
			userRepository.create = jest.fn().mockReturnValue(newUser);
			userRepository.save = jest.fn().mockResolvedValue(newUser);

			const result = await service.create(createUserDto);
			expect(result).toEqual(newUser);
			expect(userRepository.save).toHaveBeenCalledWith(newUser);
		});

		it('should throw InternalServerErrorException if there is an error saving the user', async () => {
			const createUserDto: CreateUserDto = {
				email: 'test@example.com',
				password: 'password123',
				role: UserRole.PERFORMER,
			};

			userRepository.save = jest
				.fn()
				.mockRejectedValue(new Error('Database error'));

			await expect(service.create(createUserDto)).rejects.toThrow(
				InternalServerErrorException,
			);
		});
	});

	describe('findAll', () => {
		it('should return all users successfully', async () => {
			const users = [new User(), new User()];
			userRepository.find = jest.fn().mockResolvedValue(users);

			const result = await service.findAll();
			expect(result).toEqual(users);
			expect(userRepository.find).toHaveBeenCalled();
		});

		it('should throw InternalServerErrorException if there is an error retrieving users', async () => {
			userRepository.find = jest
				.fn()
				.mockRejectedValue(new Error('Database error'));

			await expect(service.findAll()).rejects.toThrow(
				InternalServerErrorException,
			);
		});
	});

	describe('findOne', () => {
		it('should throw NotFoundException if user is not found', async () => {
			const userId = crypto.randomUUID().toString();
			userRepository.findOneBy = jest.fn().mockResolvedValue(null);

			await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
		});

		it('should return a user successfully', async () => {
			const testId = crypto.randomUUID().toString();
			const user = new User();
			user.id = testId;
			user.email = 'test@example.com';
			userRepository.findOneBy = jest.fn().mockResolvedValue(user);

			const result = await service.findOne(testId);
			expect(result).toEqual(user);
		});
	});

	describe('update', () => {
		it('should throw NotFoundException if user does not exist', async () => {
			const userId = crypto.randomUUID().toString();
			const updateUserDto: UpdateUserDto = { email: 'newemail@example.com' };
			userRepository.findOneBy = jest.fn().mockResolvedValue(null);

			await expect(service.update(userId, updateUserDto)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should update a user successfully', async () => {
			const userId = crypto.randomUUID().toString();
			const updateUserDto: UpdateUserDto = { email: 'newemail@example.com' };
			const existingUser = new User();
			existingUser.id = userId;
			existingUser.email = 'test@example.com';
			userRepository.findOneBy = jest.fn().mockResolvedValue(existingUser);
			userRepository.save = jest
				.fn()
				.mockResolvedValue({ ...existingUser, ...updateUserDto });

			const result = await service.update(userId, updateUserDto);
			expect(result.email).toBe('newemail@example.com');
			expect(userRepository.save).toHaveBeenCalled();
		});

		it('should throw InternalServerErrorException if there is an error during update', async () => {
			const userId = crypto.randomUUID().toString();
			const updateUserDto: UpdateUserDto = { email: 'newemail@example.com' };
			const existingUser = new User();
			existingUser.id = userId;
			existingUser.email = 'test@example.com';

			userRepository.findOneBy = jest.fn().mockResolvedValue(existingUser);
			userRepository.save = jest
				.fn()
				.mockRejectedValue(new Error('Database error'));

			await expect(service.update(userId, updateUserDto)).rejects.toThrow(
				InternalServerErrorException,
			);
		});
	});

	describe('remove', () => {
		it('should throw NotFoundException if user does not exist', async () => {
			const userId = crypto.randomUUID().toString();
			userRepository.findOneBy = jest.fn().mockResolvedValue(null);

			await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
		});

		it('should remove a user successfully', async () => {
			const userId = crypto.randomUUID().toString();
			const existingUser = new User();
			existingUser.id = userId;
			userRepository.findOneBy = jest.fn().mockResolvedValue(existingUser);
			userRepository.remove = jest.fn().mockResolvedValue(undefined);

			await service.remove(userId);
			expect(userRepository.remove).toHaveBeenCalledWith(existingUser);
		});

		it('should throw InternalServerErrorException if there is an error during removal', async () => {
			const userId = crypto.randomUUID().toString();
			const existingUser = new User();
			existingUser.id = userId;

			userRepository.findOneBy = jest.fn().mockResolvedValue(existingUser);
			userRepository.remove = jest
				.fn()
				.mockRejectedValue(new Error('Database error'));

			await expect(service.remove(userId)).rejects.toThrow(
				InternalServerErrorException,
			);
		});
	});
});
