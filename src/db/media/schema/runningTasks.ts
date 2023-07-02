import { text, sqliteTable, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const runningTasks = sqliteTable('runningTasks', {
	id: text('id'),
	title: text('title').notNull(),
	value: integer('value').notNull(),
	type: text('type').notNull(),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
}, db => ({
	pk: primaryKey(db.id),
	unique: uniqueIndex('runningTasks_unique').on(db.title, db.type),
}));
