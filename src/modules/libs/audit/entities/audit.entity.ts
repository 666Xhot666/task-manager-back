import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../../user/entities/user.entity';

export enum ActionTypes {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}

export enum EntityType {
	USER = 'User',
	PROJECT = 'Project',
	TASK = 'Task',
}

@Entity()
export class AuditLog {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'enum',
		enum: ActionTypes,
	})
	action: ActionTypes;

	@Column({
		type: 'enum',
		enum: EntityType,
	})
	entityType: EntityType;

	@Column()
	entityId: string;

	@Column('json', { nullable: true })
	oldValue: Record<string, any>;

	@Column('json', { nullable: true })
	newValue: Record<string, any>;

	@ManyToOne(() => User, { eager: true })
	performedBy: User;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	timestamp: Date;
}
