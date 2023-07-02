
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { musicGenres } from './musicGenres';
import { tracks } from './tracks';
import { relations } from 'drizzle-orm';

export const musicGenre_track = sqliteTable('musicGenre_track', {
	musicGenre_id: text('musicGenre_id')
		.references(() => musicGenres.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	track_id: text('track_id')
		.references(() => tracks.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.musicGenre_id, db.track_id),
}));

export const musicGenre_trackRelations = relations(musicGenre_track, ({ one }) => ({
	musicGenre: one(musicGenres, {
		fields: [musicGenre_track.musicGenre_id],
		references: [musicGenres.id],
	}),
	track: one(tracks, {
		fields: [musicGenre_track.track_id],
		references: [tracks.id],
	}),
}));
