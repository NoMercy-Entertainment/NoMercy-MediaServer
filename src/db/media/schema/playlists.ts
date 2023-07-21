import { text, sqliteTable, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { playlist_track } from './playlist_track';

export const playlists = sqliteTable('playlists', {
	id: text('id'),
	user_id: text('user_id').notNull(),
	name: text('name').notNull(),
	description: text('description'),
	cover: text('cover'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

}, db => ({
	pk: primaryKey(db.id),
	index: index('playlists_index').on(db.id),
	unique: uniqueIndex('playlists_unique').on(db.user_id, db.id),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
	playlist_track: many(playlist_track),
}));
