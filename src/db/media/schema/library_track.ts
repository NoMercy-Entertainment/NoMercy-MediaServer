
import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { tracks } from './tracks';
import { relations } from 'drizzle-orm';

export const library_track = sqliteTable('library_track', {
	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	track_id: text('track_id')
		.references(() => tracks.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.library_id, db.track_id),
}));

export const library_trackRelations = relations(library_track, ({ one }) => ({
	library: one(libraries, {
		fields: [library_track.library_id],
		references: [libraries.id],
	}),
	track: one(tracks, {
		fields: [library_track.track_id],
		references: [tracks.id],
	}),
}));
