import { Module } from '@nestjs/common';

import { ApiSyncQueueModule } from './api-sync/api-sync-queue.module';
import { CleanupQueueModule } from './cleanup/cleanup-queue.module';
import { EmailQueueModule } from './email/email-queue.module';

@Module({
	imports: [ApiSyncQueueModule, CleanupQueueModule, EmailQueueModule],
	exports: [ApiSyncQueueModule, CleanupQueueModule, EmailQueueModule],
})
export class QueueModule {}
