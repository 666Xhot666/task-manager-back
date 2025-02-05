import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../../user/entities/user.entity';

@Entity('jwt-id')
export class JwtId {
	@PrimaryGeneratedColumn('uuid')
	id: string;
	@Column({ name: 'expires-at', type: 'timestamp' })
	expiresAt: Date;
	@ManyToOne(() => User, (user) => user.jwtIds)
	user: User;
}
