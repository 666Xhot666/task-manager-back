import { ApiProperty } from '@nestjs/swagger';

export class TaskStatusStatsDto {
	@ApiProperty({ example: { 'To Do': 5, 'In Progress': 3, Done: 2 } })
	stats: Record<string, number>;
}
