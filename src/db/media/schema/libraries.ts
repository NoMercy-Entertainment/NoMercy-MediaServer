import { boolean, datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { folder_library } from './folder_library';
import { language_library } from './language_library';
import { library_user } from './library_user';
import { file_library } from './file_library';
import { library_tv } from './library_tv';
import { library_movie } from './library_movie';
import { collection_library } from './collection_library';
import { encoderProfile_library } from './encoderProfile_library';
import { album_library } from './album_library';
import { artist_library } from './artist_library';
import { library_track } from './library_track';

export const libraries = sqliteTable('libraries', {
	id: text('id'),
	autoRefreshInterval: integer('autoRefreshInterval')
		.notNull(),
	chapterImages: boolean('chapterImages')
		.notNull(),
	extractChapters: boolean('extractChapters')
		.notNull(),
	extractChaptersDuring: boolean('extractChaptersDuring')
		.notNull(),
	image: text('image'),
	perfectSubtitleMatch: boolean('perfectSubtitleMatch')
		.notNull(),
	realtime: boolean('realtime')
		.notNull(),
	specialSeasonName: text('specialSeasonName')
		.notNull(),
	title: text('title')
		.notNull(),
	order: integer('order')
		.default(99),
	type: text('type')
		.notNull(),
	country: text('country')
		.notNull(),
	language: text('language')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	created_at: datetime('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: datetime('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}, db => ({
	pk: primaryKey(db.id),
	unique: uniqueIndex('library_index')
		.on(db.id, db.title),
}));

export const librariesRelations = relations(libraries, ({ many }) => ({
	folder_library: many(folder_library),
	language_library: many(language_library),
	encoderProfile_library: many(encoderProfile_library),
	library_user: many(library_user),
	file_library: many(file_library),

	library_tv: many(library_tv),
	library_movie: many(library_movie),
	library_track: many(library_track),

	collection_library: many(collection_library),
	album_library: many(album_library),
	artist_library: many(artist_library),
}));
