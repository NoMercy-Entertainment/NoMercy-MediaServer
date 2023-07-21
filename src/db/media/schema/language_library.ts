import { text, sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { languages } from './languages';
import { relations } from 'drizzle-orm';

export const language_library = sqliteTable('language_library', {
	language_id: integer('language_id')
		.references(() => languages.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	type: text('type')
		.notNull(),
}, db => ({
	pk: primaryKey(db.language_id, db.library_id, db.type),
}));

export const language_libraryRelations = relations(language_library, ({ one }) => ({
	language: one(languages, {
		fields: [language_library.language_id],
		references: [languages.id],
	}),
	library: one(libraries, {
		fields: [language_library.library_id],
		references: [libraries.id],
	}),
}));
