import { text, sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { movies } from './movies';
import { certifications } from './certifications';
import { relations } from 'drizzle-orm';

export const certification_movie = sqliteTable('certification_movie', {
	iso31661: text('iso31661'),

	certification_id: integer('certification_id')
		.references(() => certifications.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.iso31661, db.certification_id, db.movie_id),
}));

export const certification_movieRelations = relations(certification_movie, ({ one }) => ({
	certification: one(certifications, {
		fields: [certification_movie.certification_id],
		references: [certifications.id],
	}),
	movie: one(movies, {
		fields: [certification_movie.movie_id],
		references: [movies.id],
	}),
}));
