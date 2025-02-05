import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CLEANUP_QUEUE } from '../../../shared/constants/queues/queues.contants';
import { Project } from '../../project/entities/project.entity';
import { Task } from '../../task/entities/task.entity';

import { CleanupQueueConsumer } from './cleanup-queue.consumer';
import { CleanupQueueProducer } from './cleanup-queue.producer';

@Module({
	imports: [
		BullModule.registerQueue({
			name: CLEANUP_QUEUE,
		}),
		TypeOrmModule.forFeature([Project, Task]),
	],
	providers: [CleanupQueueProducer, CleanupQueueConsumer],
	exports: [CleanupQueueProducer],
})
export class CleanupQueueModule {}
