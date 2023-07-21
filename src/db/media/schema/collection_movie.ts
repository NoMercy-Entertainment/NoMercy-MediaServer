import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { movies } from './movies';
import { collections } from './collections';
import { relations } from 'drizzle-orm';

export const collection_movie = sqliteTable('collection_movie', {
	collection_id: integer('collection_id')
		.references(() => collections.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.collection_id, db.movie_id),
}));

export const collection_movieRelations = relations(collection_movie, ({ one }) => ({
	collection: one(collections, {
		fields: [collection_movie.collection_id],
		references: [collections.id],
	}),
	movie: one(movies, {
		fields: [collection_movie.movie_id],
		references: [movies.id],
	}),
}));
