import { Logger } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Task } from './entities/task.entity';
import { TaskEvent, TaskEventType } from './types/task-events.types';

@WebSocketGateway({
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || '*',
	},
	namespace: 'tasks',
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private readonly logger = new Logger(TaskGateway.name);
	private readonly clients = new Map<string, Socket>();

	handleConnection(client: Socket) {
		try {
			this.clients.set(client.id, client);
			this.logger.log(`Client connected: ${client.id}`);
		} catch (error) {
			this.logger.error(
				`Connection error: ${error instanceof Error ? error.message : 'Error'}`,
			);
			throw new WsException('Connection error');
		}
	}

	handleDisconnect(client: Socket) {
		try {
			this.clients.delete(client.id);
			this.logger.log(`Client disconnected: ${client.id}`);
		} catch (error) {
			this.logger.error(
				`Disconnection error: ${error instanceof Error ? error.message : 'Error'}`,
			);
		}
	}

	notifyTaskCreated(task: Task, userId: string) {
		try {
			const event: TaskEvent = {
				type: TaskEventType.CREATED,
				payload: task,
				timestamp: new Date().toISOString(),
				userId,
			};
			this.server.emit(TaskEventType.CREATED, event);
			this.logger.debug(`Task created event emitted: ${task.id}`);
		} catch (error) {
			this.logger.error(
				`Error emitting task created event: ${error instanceof Error ? error.message : 'Error'}`,
			);
		}
	}

	notifyTaskUpdated(task: Task, userId: string) {
		try {
			const event: TaskEvent = {
				type: TaskEventType.UPDATED,
				payload: task,
				timestamp: new Date().toISOString(),
				userId,
			};
			this.server.emit(TaskEventType.UPDATED, event);
			this.logger.debug(`Task updated event emitted: ${task.id}`);
		} catch (error) {
			this.logger.error(
				`Error emitting task updated event: ${error instanceof Error ? error.message : 'Error'}`,
			);
		}
	}
}
