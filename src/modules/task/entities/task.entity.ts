import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Project } from '../../project/entities/project.entity';
import { User } from '../../user/entities/user.entity';

export enum TaskStatus {
	TO_DO = 'To Do',
	IN_PROGRESS = 'In Progress',
	DONE = 'Done',
}

@Entity()
export class Task {
	@ApiProperty({
		description: 'Unique identifier for the task',
		example: 1,
	})
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({
		description: 'Title of the task',
		example: 'Complete project documentation',
	})
	@Column()
	title: string;

	@Exclude()
	@ManyToOne(() => User, (user) => user.tasks)
	assignee: User;

	@ApiProperty({
		description: 'ID of the assignee',
		example: 'b1e5f62e-e3f8-442b-9f60-d32fa2e2d6f4',
	})
	@Column()
	assigneeId: string;

	@ApiProperty({
		description: 'Current status of the task',
		enum: TaskStatus,
		default: TaskStatus.TO_DO,
		example: TaskStatus.TO_DO,
	})
	@Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TO_DO })
	status: TaskStatus;

	@ApiProperty({
		description: 'Deadline of the task',
		type: String,
		format: 'date-time',
		example: '2025-01-01T00:00:00.000Z',
	})
	@Column()
	deadline: Date;

	@ApiProperty({
		description: 'Date when task was marked as Done',
		type: String,
		format: 'date-time',
		example: '2025-01-01T00:00:00.000Z',
	})
	@Column({
		nullable: true,
	})
	completedAt: Date;

	@Exclude()
	@ManyToOne(() => Project, (project) => project.tasks)
	project: Project;

	@ApiProperty({
		description: 'ID of the project',
		example: 'fda8e3ad-19c3-467e-b16a-ea4ad372d8bb',
	})
	@Column()
	projectId: string;
}
