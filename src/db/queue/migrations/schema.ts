import { sqliteTable, numeric, text, index, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';


export const drizzleMigrations = sqliteTable('__drizzle_migrations', {
	id: numeric('id').primaryKey(),
	hash: text('hash').notNull(),
	createdAt: numeric('created_at'),
});

export const failedJobs = sqliteTable('failedJobs', {
	id: text('id'),
	payload: text('payload'),
	queue: text('queue').notNull(),
	exception: text('exception').notNull(),
	connection: numeric('connection'),
	failedAt: numeric('failedAt').default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		failedJobsIdIdx: index('failed_jobs_id_index').on(table.id),
	};
});

export const queueJobs = sqliteTable('queueJobs', {
	id: integer('id').primaryKey({ autoIncrement: true })
		.notNull(),
	queue: text('queue').notNull(),
	taskId: text('task_id').notNull(),
	runAt: numeric('runAt'),
	payload: text('payload'),
	result: text('result'),
	error: text('error'),
	progress: integer('progress').default(0)
		.notNull(),
	priority: integer('priority').default(0)
		.notNull(),
	attempts: integer('attempts').default(0)
		.notNull(),
	finishedAt: numeric('finishedAt'),
	failedAt: numeric('failedAt'),
	createdAt: numeric('created_at').default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		queueJobsIdIdx: index('queue_jobs_id_index').on(table.queue, table.priority, table.runAt, table.finishedAt),
	};
});
