import { datetime } from '../../helpers';
import { InferModel, sql } from 'drizzle-orm';
import { text, sqliteTable, index, integer } from 'drizzle-orm/sqlite-core';

export const queueJobs = sqliteTable('queueJobs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	queue: text('queue').notNull(),
	task_id: text('task_id').notNull(),
	runAt: datetime('runAt'),
	payload: text('payload'),
	result: text('result'),
	error: text('error'),
	progress: integer('progress')
		.default(0)
		.notNull(),
	// key: text('key'),
	// cron: text('cron'),
	priority: integer('priority')
		.default(0)
		.notNull(),
	attempts: integer('attempts')
		.default(0)
		.notNull(),
	// maxAttempts: integer('maxAttempts')
	// 	.default(0)
	// 	.notNull(),
	// notBefore: datetime('notBefore'),
	finishedAt: datetime('finishedAt'),
	// processedAt: datetime('processedAt'),
	failedAt: datetime('failedAt'),

	created_at: datetime('created_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),

}, db => ({
	index: index('queue_jobs_id_index').on(db.queue, db.priority, db.runAt, db.finishedAt),
}));

export type QueueJob = InferModel<typeof queueJobs, 'select'>;
