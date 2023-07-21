import { text, sqliteTable, integer, index, uniqueIndex, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { movies } from './movies';
import { libraries } from './libraries';
import { boolean, datetime } from '@server/db/helpers';
import { albums } from './albums';
import { episodes } from './episodes';

export const files = sqliteTable('files', {
	id: text('id'),
	folder: text('folder').notNull(),
	episodeNumber: integer('episodeNumber'),
	seasonNumber: integer('seasonNumber'),
	episodeFolder: text('episodeFolder'),
	name: text('name').notNull(),
	extension: text('extension').notNull(),
	year: integer('year'),
	size: real('size').notNull(),
	atimeMs: real('atimeMs').notNull(),
	birthtimeMs: real('birthtimeMs').notNull(),
	ctimeMs: real('ctimeMs').notNull(),
	edition: text('edition'),
	resolution: text('resolution'),
	videoCodec: text('videoCodec'),
	audioCodec: text('audioCodec'),
	audioChannels: text('audioChannels'),
	ffprobe: text('ffprobe'),
	chapters: text('chapters'),
	fullSeason: boolean('fullSeason'),
	gid: integer('gid'),
	group: text('group'),
	airDate: datetime('airDate'),
	multi: boolean('multi'),
	complete: boolean('complete'),
	isMultiSeason: boolean('isMultiSeason'),
	isPartialSeason: boolean('isPartialSeason'),
	isSeasonExtra: boolean('isSeasonExtra'),
	isSpecial: boolean('isSpecial'),
	isTv: boolean('isTv'),
	languages: text('languages'),
	mode: real('mode'),
	mtimeMs: real('mtimeMs'),
	nlink: real('nlink'),
	path: text('path').notNull(),
	revision: text('revision'),
	seasonPart: real('seasonPart'),
	sources: text('sources'),
	title: text('title').notNull(),
	type: text('type').notNull(),
	uid: real('uid'),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	album_id: integer('album_id')
		.references(() => albums.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	episode_id: integer('episode_id')
		.references(() => episodes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	pk: primaryKey(db.id),
	index: index('files_index').on(db.path, db.library_id),
	unique: uniqueIndex('files_unique').on(db.path),
}));

export const filesRelations = relations(files, ({ one }) => ({
	library: one(libraries, {
		fields: [files.library_id],
		references: [libraries.id],
	}),
	movie: one(movies, {
		fields: [files.movie_id],
		references: [movies.id],
	}),
	album: one(albums, {
		fields: [files.album_id],
		references: [albums.id],
	}),
	episode: one(episodes, {
		fields: [files.episode_id],
		references: [episodes.id],
	}),
}));
