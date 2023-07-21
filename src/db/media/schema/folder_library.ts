import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { folders } from './folders';
import { relations } from 'drizzle-orm';

export const folder_library = sqliteTable('folder_library', {
	folder_id: text('folder_id')
		.references(() => folders.id)
		.notNull(),
	library_id: text('library_id')
		.references(() => libraries.id)
		.notNull(),
}, db => ({
	pk: primaryKey(db.folder_id, db.library_id),
}));

export const folder_libraryRelations = relations(folder_library, ({ one }) => ({
	folder: one(folders, {
		fields: [folder_library.folder_id],
		references: [folders.id],
	}),
	library: one(libraries, {
		fields: [folder_library.library_id],
		references: [libraries.id],
	}),
}));
