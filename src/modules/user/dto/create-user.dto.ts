import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	MaxLength,
	MinLength,
} from 'class-validator';

import { User, UserRole } from '../entities/user.entity';

export class CreateUserDto implements Omit<User, 'id'> {
	@ApiProperty({
		description: 'User email address',
		example: 'user@example.com',
	})
	@IsEmail({}, { message: 'Invalid email format' })
	@IsNotEmpty({ message: 'Email is required' })
	email: string;

	@ApiProperty({
		description: 'User password',
		example: 'Password123!',
	})
	@IsNotEmpty({ message: 'Password is required' })
	@MinLength(8, { message: 'Password must be at least 8 characters' })
	@MaxLength(20, { message: 'Password must be at most 20 characters' })
	@IsNotEmpty({ message: 'Password is required' })
	password: string;

	@ApiProperty({
		type: String,
		enum: UserRole,
		enumName: 'UserRole',
		description: 'The role assigned to the user',
		example: UserRole.PERFORMER,
	})
	@IsEnum(UserRole, {
		message: 'Role must be a valid value from UserRole enum',
	})
	@IsNotEmpty({ message: 'Role is required' })
	role: UserRole;
}
