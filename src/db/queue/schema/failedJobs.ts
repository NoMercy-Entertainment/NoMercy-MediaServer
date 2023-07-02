import { datetime } from '../../helpers';
import { sql } from 'drizzle-orm';
import { text, sqliteTable, index } from 'drizzle-orm/sqlite-core';

export const failedJobs = sqliteTable('failedJobs', {
	id: text('id'),
	payload: text('payload'),
	queue: text('queue').notNull(),
	exception: text('exception').notNull(),
	connection: datetime('connection'),

	failedAt: datetime('failedAt').notNull()
		.default(sql`CURRENT_TIMESTAMP`),

}, db => ({
	index: index('failed_jobs_id_index').on(db.id),
}));
