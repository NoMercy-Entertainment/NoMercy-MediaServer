
import { datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, index } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { images } from './images';
import { album_artist } from './album_artist';
import { artist_track } from './artist_track';
import { tracks } from './tracks';

export const artists = sqliteTable('artists', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	folder: text('folder'),
	cover: text('cover'),
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
	index: index('artist_id_index').on(db.id),
}));

export const artistsRelations = relations(artists, ({ many, one }) => ({
	artist_track: many(artist_track),
	album_artist: many(album_artist),
	images: many(images),
	tracks: many(tracks),
	library: one(libraries, {
		fields: [artists.library_id],
		references: [libraries.id],
	}),
}));
