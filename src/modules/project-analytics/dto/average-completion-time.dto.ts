import { ApiProperty } from '@nestjs/swagger';

export class AverageCompletionTimeDto {
	@ApiProperty({ example: '2d 5h 30m' })
	averageTime: string;
}
