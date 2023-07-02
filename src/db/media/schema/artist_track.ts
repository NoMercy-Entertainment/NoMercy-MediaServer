
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { artists } from './artists';
import { relations } from 'drizzle-orm';
import { tracks } from './tracks';

export const artist_track = sqliteTable('artist_track', {
	artist_id: text('artist_id')
		.references(() => artists.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	track_id: text('track_id')
		.references(() => tracks.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.artist_id, db.track_id),
}));

export const artist_trackRelations = relations(artist_track, ({ one }) => ({
	artist: one(artists, {
		fields: [artist_track.artist_id],
		references: [artists.id],
	}),
	track: one(tracks, {
		fields: [artist_track.track_id],
		references: [tracks.id],
	}),
}));
