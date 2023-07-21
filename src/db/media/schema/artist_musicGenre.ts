
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { musicGenres } from './musicGenres';
import { artists } from './artists';
import { relations } from 'drizzle-orm';

export const artist_musicGenre = sqliteTable('artist_musicGenre', {
	artist_id: text('artist_id')
		.references(() => artists.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	musicGenre_id: text('musicGenre_id')
		.references(() => musicGenres.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.musicGenre_id, db.artist_id),
}));

export const artist_musicGenreRelations = relations(artist_musicGenre, ({ one }) => ({
	artist: one(artists, {
		fields: [artist_musicGenre.artist_id],
		references: [artists.id],
	}),
	musicGenre: one(musicGenres, {
		fields: [artist_musicGenre.musicGenre_id],
		references: [musicGenres.id],
	}),
}));
