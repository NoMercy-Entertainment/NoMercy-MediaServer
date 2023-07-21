import { text, sqliteTable, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { playlist_track } from './playlist_track';
import { album_track } from './album_track';
import { musicGenre_track } from './musicGenre_track';
import { artist_track } from './artist_track';
import { images } from './images';
import { track_user } from './track_user';
import { library_track } from './library_track';
import { folders } from './folders';

export const tracks = sqliteTable('tracks', {
	id: text('id').primaryKey(),
	name: text('name'),
	track: integer('track'),
	disc: integer('disc'),
	cover: text('cover'),
	date: text('date'),
	folder: text('folder'),
	filename: text('filename'),
	duration: text('duration'),
	quality: integer('quality'),
	path: text('path'),
	lyrics: text('lyrics'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),

	folder_id: text('folder_id')
		.references(() => folders.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}, db => ({
	index: index('tracks_index').on(db.id),
	unique: uniqueIndex('tracks_unique').on(db.filename, db.path),
}));

export const tracksRelations = relations(tracks, ({ many }) => ({
	album_track: many(album_track),
	artist_track: many(artist_track),
	library_track: many(library_track),
	playlist_track: many(playlist_track),
	images: many(images),
	track_user: many(track_user),
	musicGenre_track: many(musicGenre_track),
}));
