
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { artists } from './artists';
import { libraries } from './libraries';
import { relations } from 'drizzle-orm';

export const artist_library = sqliteTable('artist_library', {
	artist_id: text('artist_id')
		.references(() => artists.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.artist_id, db.library_id),
}));

export const artist_libraryRelations = relations(artist_library, ({ one }) => ({
	artist: one(artists, {
		fields: [artist_library.artist_id],
		references: [artists.id],
	}),
	library: one(libraries, {
		fields: [artist_library.library_id],
		references: [libraries.id],
	}),
}));
