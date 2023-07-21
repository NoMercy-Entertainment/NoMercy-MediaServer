import { text, sqliteTable, index, uniqueIndex, integer } from 'drizzle-orm/sqlite-core';

export const countries = sqliteTable('countries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	iso31661: text('iso31661').notNull(),
	english_name: text('english_name'),
	native_name: text('native_name'),
}, db => ({
	index: index('countries_index').on(db.id),
	unique: uniqueIndex('countries_unique').on(db.iso31661),
}));
