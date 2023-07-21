import { text, sqliteTable, index, uniqueIndex, integer } from 'drizzle-orm/sqlite-core';
import { language_library } from './language_library';
import { relations } from 'drizzle-orm';

export const languages = sqliteTable('languages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	iso_639_1: text('iso_639_1').notNull(),
	english_name: text('english_name').notNull(),
	name: text('name'),
}, db => ({
	index: index('language_index').on(db.iso_639_1),
	unique: uniqueIndex('language_unique').on(db.iso_639_1),
}));

export const languagesRelations = relations(languages, ({ many }) => ({
	language_library: many(language_library),
}));
