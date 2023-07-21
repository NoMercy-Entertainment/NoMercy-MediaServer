
import { datetime } from '../../helpers';
import { sql } from 'drizzle-orm';
import { text, sqliteTable, uniqueIndex, integer, index } from 'drizzle-orm/sqlite-core';

export const configuration = sqliteTable('configuration', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	key: text('key').notNull(),
	value: text('value'),
	modified_by: text('modified_by'),
	created_at: datetime('created_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),
}, db => ({
	index: index('configuration_index').on(db.key),
	unique: uniqueIndex('configuration_unique').on(db.key),
}));
