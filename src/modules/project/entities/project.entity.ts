import { ApiProperty } from '@nestjs/swagger';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { Task } from '../../task/entities/task.entity';
import { User } from '../../user/entities/user.entity';

export enum ProjectStatus {
	ACTIVE = 'ACTIVE',
	COMPLETED = 'COMPLETED',
}

@Entity('projects')
export class Project {
	@PrimaryGeneratedColumn('uuid')
	@ApiProperty({
		description: 'Unique identifier for the project.',
		example: 'd7e4b0f1-9132-4f8d-9f37-d194f72b1f98',
	})
	id: string;

	@Column()
	@ApiProperty({
		description: 'The title of the project.',
		example: 'Project Apollo',
	})
	title: string;

	@Column({ default: '' })
	@ApiProperty({
		description: 'A brief description of the project.',
		example: 'A mission to land on the moon.',
	})
	description: string;

	@Column({
		type: 'enum',
		enum: ProjectStatus,
		default: ProjectStatus.ACTIVE,
	})
	@ApiProperty({
		description: 'The current status of the project.',
		enum: ProjectStatus,
		default: ProjectStatus.ACTIVE,
	})
	status: ProjectStatus;

	@ManyToOne(() => User, (user) => user.projects)
	@ApiProperty({
		description: 'The team head (manager) overseeing the project.',
		type: () => User,
	})
	teamHead: User;

	@Column()
	teamHeadId: string;

	@OneToMany(() => Task, (task) => task.project)
	@ApiProperty({
		description: 'List of tasks associated with this project.',
		type: () => [Task],
		nullable: true,
	})
	tasks?: Task[];
	@ApiProperty({
		description: 'Date when project was marked as Completed',
		type: String,
		format: 'date-time',
		example: '2025-01-01T00:00:00.000Z',
	})
	@Column({
		nullable: true,
	})
	completedAt: Date;
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
