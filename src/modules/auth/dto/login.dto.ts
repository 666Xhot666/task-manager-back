import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
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
}
