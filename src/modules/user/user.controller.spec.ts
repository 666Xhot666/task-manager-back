import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
	let controller: UserController;
	let service: UserService;

	const mockUserService = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};

	const mockCreateUserDto: CreateUserDto = {
		email: 'test@example.com',
		password: 'password123',
		role: UserRole.ADMIN,
	};
	const mockCreateUserDtoWithoutRole = {
		email: 'test@example.com',
		password: 'password123',
	};

	const mockUpdateUserDto: UpdateUserDto = {
		email: 'updated@example.com',
		role: UserRole.MANAGER,
	};

	const mockUser: User = {
		id: '1',
		email: 'test@example.com',
		password: 'hashedpassword',
		role: UserRole.ADMIN,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: mockUserService,
				},
			],
		}).compile();

		controller = module.get<UserController>(UserController);
		service = module.get<UserService>(UserService);
	});

	describe('create', () => {
		it('should create a user', async () => {
			mockUserService.create.mockResolvedValue(mockUser);

			const result = await controller.create(mockCreateUserDto);
			expect(result).toEqual(mockUser);
			expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
		});

		it('should throw a conflict exception if user already exists', async () => {
			mockUserService.create.mockRejectedValueOnce(
				new ConflictException('Email already in use'),
			);

			await expect(controller.create(mockCreateUserDto)).rejects.toThrowError(
				ConflictException,
			);
			expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
		});
		it('should throw a bad request exception if user role unspecified', async () => {
			mockUserService.create.mockRejectedValueOnce(
				new ConflictException('User role unspecified'),
			);

			await expect(
				//@ts-expect-error missing role
				controller.create(mockCreateUserDtoWithoutRole),
			).rejects.toThrowError(ConflictException);
			expect(service.create).toHaveBeenCalledWith(mockCreateUserDtoWithoutRole);
		});
	});

	describe('findAll', () => {
		it('should return all users', async () => {
			mockUserService.findAll.mockResolvedValue([mockUser]);

			const result = await controller.findAll();
			expect(result).toEqual([mockUser]);
			expect(service.findAll).toHaveBeenCalled();
		});
	});

	describe('findOne', () => {
		it('should return a user by ID', async () => {
			mockUserService.findOne.mockResolvedValue(mockUser);

			const result = await controller.findOne('1');
			expect(result).toEqual(mockUser);
			expect(service.findOne).toHaveBeenCalledWith('1');
		});

		it('should throw a not found exception if user does not exist', async () => {
			mockUserService.findOne.mockRejectedValueOnce(
				new NotFoundException('User not found'),
			);

			await expect(controller.findOne('1')).rejects.toThrowError(
				NotFoundException,
			);
			expect(service.findOne).toHaveBeenCalledWith('1');
		});
	});

	describe('update', () => {
		it('should update a user', async () => {
			mockUserService.update.mockResolvedValue({
				...mockUser,
				...mockUpdateUserDto,
			});

			const result = await controller.update('1', mockUpdateUserDto);
			expect(result).toEqual({ ...mockUser, ...mockUpdateUserDto });
			expect(service.update).toHaveBeenCalledWith('1', mockUpdateUserDto);
		});

		it('should throw a not found exception if user does not exist', async () => {
			mockUserService.update.mockRejectedValueOnce(
				new NotFoundException('User not found'),
			);

			await expect(
				controller.update('1', mockUpdateUserDto),
			).rejects.toThrowError(NotFoundException);
			expect(service.update).toHaveBeenCalledWith('1', mockUpdateUserDto);
		});
	});

	describe('remove', () => {
		it('should remove a user by ID', async () => {
			mockUserService.remove.mockResolvedValue(undefined);

			await controller.remove('1');
			expect(service.remove).toHaveBeenCalledWith('1');
		});

		it('should throw a not found exception if user does not exist', async () => {
			mockUserService.remove.mockRejectedValueOnce(
				new NotFoundException('User not found'),
			);

			await expect(controller.remove('1')).rejects.toThrowError(
				NotFoundException,
			);
			expect(service.remove).toHaveBeenCalledWith('1');
		});
	});
});
