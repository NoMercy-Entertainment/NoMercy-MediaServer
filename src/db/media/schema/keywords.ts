import { text, sqliteTable, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const keywords = sqliteTable('keywords', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
}, db => ({
	index: index('keywords_index').on(db.id),
	unique: uniqueIndex('keywords_unique').on(db.id),
}));
