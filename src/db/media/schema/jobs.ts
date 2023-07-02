
import { datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { crews } from './crews';

export const jobs = sqliteTable('jobs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	credit_id: text('credit_id')
		.notNull(),
	job: text('job')
		.notNull(),
	episodeCount: integer('episodeCount'),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	crew_id: text('crew_id')
		.references(() => crews.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, db => ({
	index: index('jobs_index').on(db.id),
	unique: uniqueIndex('jobs_unique').on(db.credit_id),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
	crew: one(crews, {
		fields: [jobs.crew_id],
		references: [crews.id],
	}),
}));
