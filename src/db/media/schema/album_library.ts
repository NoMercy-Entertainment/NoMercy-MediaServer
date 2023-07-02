
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { albums } from './albums';
import { libraries } from './libraries';
import { relations } from 'drizzle-orm';

export const album_library = sqliteTable('album_library', {
	album_id: text('album_id')
		.references(() => albums.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.album_id, db.library_id),
}));

export const album_libraryRelations = relations(album_library, ({ one }) => ({
	album: one(albums, {
		fields: [album_library.album_id],
		references: [albums.id],
	}),
	library: one(libraries, {
		fields: [album_library.library_id],
		references: [libraries.id],
	}),
}));
