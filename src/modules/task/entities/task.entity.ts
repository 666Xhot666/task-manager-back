import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

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
	@ApiProperty({
		description: 'Creation timestamp',
		example: '2025-02-05T10:12:30Z',
	})
	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@ApiProperty({
		description: 'Last update timestamp',
		example: '2025-02-05T10:12:30Z',
	})
	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	@ApiProperty({
		description: 'Deletion timestamp',
		example: '2025-02-05T10:12:30Z',
		nullable: true,
	})
	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deletedAt?: Date;
}
