import { text, sqliteTable, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { musicGenre_track } from './musicGenre_track';
import { album_musicGenre } from './album_musicGenre';
import { artist_musicGenre } from './artist_musicGenre';

export const musicGenres = sqliteTable('musicGenres', {
	id: text('id'),
	name: text('name').notNull(),

}, db => ({
	pk: primaryKey(db.id),
	index: index('musicGenres_index').on(db.id),
	unique: uniqueIndex('musicGenres_unique').on(db.name),
}));

export const musicGenresRelations = relations(musicGenres, ({ many }) => ({
	musicGenre_track: many(musicGenre_track),
	album_musicGenre: many(album_musicGenre),
	artist_musicGenre: many(artist_musicGenre),
}));
