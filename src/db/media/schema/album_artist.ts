
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { albums } from './albums';
import { artists } from './artists';
import { relations } from 'drizzle-orm';

export const album_artist = sqliteTable('album_artist', {
	album_id: text('album_id')
		.references(() => albums.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	artist_id: text('artist_id')
		.references(() => artists.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.album_id, db.artist_id),
}));

export const album_artistRelations = relations(album_artist, ({ one }) => ({
	album: one(albums, {
		fields: [album_artist.album_id],
		references: [albums.id],
	}),
	artist: one(artists, {
		fields: [album_artist.artist_id],
		references: [artists.id],
	}),
}));
