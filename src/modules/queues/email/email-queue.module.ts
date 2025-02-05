import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EMAIL_QUEUE } from '../../../shared/constants/queues/queues.contants';
import { MailModule } from '../../libs/mail/mail.module';
import { Project } from '../../project/entities/project.entity';

import { EmailQueueConsumer } from './email-queue.consumer';
import { EmailQueueProducer } from './email-queue.producer';

@Module({
	imports: [
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
			},
		}),
		MailModule,
		TypeOrmModule.forFeature([Project]),
	],
	providers: [EmailQueueProducer, EmailQueueConsumer],
	exports: [EmailQueueProducer],
})
export class EmailQueueModule {}
