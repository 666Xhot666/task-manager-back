import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { JwtId } from '../../auth/jwt-id/entities/jwt-id.entity';
import { Project } from '../../project/entities/project.entity';
import { Task } from '../../task/entities/task.entity';

export enum UserRole {
	ADMIN = 'admin',
	MANAGER = 'manager',
	PERFORMER = 'performer',
}

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	@ApiProperty({ description: 'Unique identifier for the user', type: String })
	id: string;

	@Column({ unique: true })
	@ApiProperty({ description: 'Unique email of the user', type: String })
	email: string;

	@Column()
	@Exclude()
	password: string;

	@Column({
		type: 'enum',
		enum: UserRole,
	})
	@ApiProperty({
		description: 'Role of the user',
		enum: UserRole,
		enumName: 'UserRole',
	})
	role: UserRole;
	@OneToMany(() => JwtId, (jwtId) => jwtId.user)
	@Exclude()
	jwtIds?: JwtId[];

	@OneToMany(() => Project, (project) => project.teamHead)
	@Exclude()
	projects?: Project[];

	@OneToMany(() => Task, (task) => task.assignee)
	@Exclude()
	tasks?: Task[];
}
