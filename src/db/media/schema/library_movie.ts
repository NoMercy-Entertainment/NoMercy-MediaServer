import { text, sqliteTable, primaryKey, integer } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { movies } from './movies';
import { relations } from 'drizzle-orm';

export const library_movie = sqliteTable('library_movie', {
	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.library_id, db.movie_id),
}));

export const library_movieRelations = relations(library_movie, ({ one }) => ({
	library: one(libraries, {
		fields: [library_movie.library_id],
		references: [libraries.id],
	}),
	movie: one(movies, {
		fields: [library_movie.movie_id],
		references: [movies.id],
	}),
}));
