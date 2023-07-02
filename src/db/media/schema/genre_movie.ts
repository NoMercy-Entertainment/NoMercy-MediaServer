import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { movies } from './movies';
import { genres } from './genres';
import { relations } from 'drizzle-orm';

export const genre_movie = sqliteTable('genre_movie', {
	genre_id: integer('genre_id')
		.references(() => genres.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.genre_id, db.movie_id),
}));

export const genre_movieRelations = relations(genre_movie, ({ one }) => ({
	genre: one(genres, {
		fields: [genre_movie.genre_id],
		references: [genres.id],
	}),
	movie: one(movies, {
		fields: [genre_movie.movie_id],
		references: [movies.id],
	}),
}));
