import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { movies } from './movies';
import { files } from './files';
import { relations } from 'drizzle-orm';

export const file_movie = sqliteTable('file_movie', {
	file_id: text('file_id')
		.references(() => files.id)
		.notNull(),
	movie_id: text('movie_id')
		.references(() => movies.id)
		.notNull(),
}, db => ({
	pk: primaryKey(db.file_id, db.movie_id),
}));

export const file_movieRelations = relations(file_movie, ({ one }) => ({
	file: one(files, {
		fields: [file_movie.file_id],
		references: [files.id],
	}),
	movie: one(movies, {
		fields: [file_movie.movie_id],
		references: [movies.id],
	}),
}));
