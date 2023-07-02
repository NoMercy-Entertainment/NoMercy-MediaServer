import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { files } from './files';
import { relations } from 'drizzle-orm';

export const file_library = sqliteTable('file_library', {
	file_id: text('file_id')
		.references(() => files.id)
		.notNull(),
	library_id: text('library_id')
		.references(() => libraries.id)
		.notNull(),
}, db => ({
	pk: primaryKey(db.file_id, db.library_id),
}));

export const file_libraryRelations = relations(file_library, ({ one }) => ({
	file: one(files, {
		fields: [file_library.file_id],
		references: [files.id],
	}),
	library: one(libraries, {
		fields: [file_library.library_id],
		references: [libraries.id],
	}),
}));
