import { Task } from '../entities/task.entity';

export enum TaskEventType {
	CREATED = 'task.created',
	UPDATED = 'task.updated',
	STATUS_CHANGED = 'task.status_changed',
}

export interface TaskEvent {
	type: TaskEventType;
	payload: Task;
	timestamp: string;
	userId: string; // ID of the user who triggered the event
}
