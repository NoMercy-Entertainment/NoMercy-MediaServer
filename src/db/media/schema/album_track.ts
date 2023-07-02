
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { albums } from './albums';
import { tracks } from './tracks';
import { relations } from 'drizzle-orm';

export const album_track = sqliteTable('album_track', {
	album_id: text('album_id')
		.references(() => albums.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	track_id: text('track_id')
		.references(() => tracks.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.album_id, db.track_id),
}));

export const album_trackRelations = relations(album_track, ({ one }) => ({
	album: one(albums, {
		fields: [album_track.album_id],
		references: [albums.id],
	}),
	track: one(tracks, {
		fields: [album_track.track_id],
		references: [tracks.id],
	}),
}));
