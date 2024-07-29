import { text, sqliteTable, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './users';
import { tracks } from './tracks';

export const music_plays = sqliteTable('music_plays', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),

	type: text('type'),

	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	user_id: text('user_id')
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	track_id: text('track_id')
		.references(() => tracks.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.id),
	index: index('music_plays_index').on(db.track_id, db.user_id),
}));

export const music_playsRelations = relations(music_plays, ({ one }) => ({
	track: one(tracks, {
		fields: [music_plays.track_id],
		references: [tracks.id],
	}),
	user: one(users, {
		fields: [music_plays.user_id],
		references: [users.id],
	}),
}));
