import { relations } from 'drizzle-orm';
import { text, sqliteTable, index, uniqueIndex, integer } from 'drizzle-orm/sqlite-core';
import { genre_movie } from './genre_movie';
import { genre_tv } from './genre_tv';
import { musicGenre_track } from './musicGenre_track';

export const genres = sqliteTable('genres', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name'),
}, db => ({
	index: index('genres_index').on(db.id),
	unique: uniqueIndex('genres_unique').on(db.id),
}));

export const genresRelations = relations(genres, ({ many }) => ({
	genre_movie: many(genre_movie),
	genre_tv: many(genre_tv),
	musicGenre_track: many(musicGenre_track),
}));
