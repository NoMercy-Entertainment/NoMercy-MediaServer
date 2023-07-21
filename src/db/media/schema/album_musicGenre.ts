
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { musicGenres } from './musicGenres';
import { albums } from './albums';
import { relations } from 'drizzle-orm';

export const album_musicGenre = sqliteTable('album_musicGenre', {
	album_id: text('album_id')
		.references(() => albums.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	musicGenre_id: text('musicGenre_id')
		.references(() => musicGenres.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.musicGenre_id, db.album_id),
}));

export const album_musicGenreRelations = relations(album_musicGenre, ({ one }) => ({
	album: one(albums, {
		fields: [album_musicGenre.album_id],
		references: [albums.id],
	}),
	musicGenre: one(musicGenres, {
		fields: [album_musicGenre.musicGenre_id],
		references: [musicGenres.id],
	}),
}));
