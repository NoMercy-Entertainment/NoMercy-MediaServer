
import { datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, index, integer } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { images } from './images';
import { album_track } from './album_track';
import { album_artist } from './album_artist';
import { album_musicGenre } from './album_musicGenre';

export const albums = sqliteTable('albums', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	folder: text('folder'),
	cover: text('cover'),
	country: text('country'),
	year: integer('year'),
	tracks: integer('tracks'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),

	created_at: datetime('created_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	index: index('album_id_index').on(db.id),
}));

export const albumsRelations = relations(albums, ({ many, one }) => ({
	album_artist: many(album_artist),
	album_musicGenre: many(album_musicGenre),
	album_track: many(album_track),
	images: many(images),
	library: one(libraries, {
		fields: [albums.library_id],
		references: [libraries.id],
	}),
}));

