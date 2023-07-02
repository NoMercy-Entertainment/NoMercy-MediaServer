import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { tracks } from './tracks';
import { relations, sql } from 'drizzle-orm';
import { playlists } from './playlists';

export const playlist_track = sqliteTable('playlist_track', {
	playlist_id: text('playlist_id')
		.references(() => playlists.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	track_id: text('track_id')
		.references(() => tracks.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	created_at: text('created_at')
		.default(sql`datetime('now')`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`datetime('now')`)
		.notNull(),
}, db => ({
	pk: primaryKey(db.playlist_id, db.track_id),
}));

export const playlist_trackRelations = relations(playlist_track, ({ one }) => ({
	playlist: one(playlists, {
		fields: [playlist_track.playlist_id],
		references: [playlists.id],
	}),
	track: one(tracks, {
		fields: [playlist_track.track_id],
		references: [tracks.id],
	}),
}));
