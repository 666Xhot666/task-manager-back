import { ApiProperty } from '@nestjs/swagger';
import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
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
}
