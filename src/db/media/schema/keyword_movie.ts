import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { keywords } from './keywords';
import { movies } from './movies';
import { relations } from 'drizzle-orm';

export const keyword_movie = sqliteTable('keyword_movie', {
	keyword_id: integer('keyword_id')
		.references(() => keywords.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.movie_id, db.keyword_id),
}));

export const keyword_movieRelations = relations(keyword_movie, ({ one }) => ({
	keyword: one(keywords, {
		fields: [keyword_movie.keyword_id],
		references: [keywords.id],
	}),
	movie: one(movies, {
		fields: [keyword_movie.movie_id],
		references: [movies.id],
	}),
}));

