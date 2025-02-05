import { ApiProperty } from '@nestjs/swagger';

export class TopUserDto {
	@ApiProperty({ example: 'user@example.com' })
	email: string;

	@ApiProperty({ example: 42 })
	completedTasks: number;
}