import { text, sqliteTable, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { tvs } from './tvs';
import { movies } from './movies';
import { relations } from 'drizzle-orm';

export const similars = sqliteTable('similars', {
	id: text('id'),
	backdrop: text('backdrop'),
	overview: text('overview'),
	poster: text('poster'),
	title: text('title').notNull(),
	titleSort: text('titleSort').notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	media_id: integer('media_id'),

	tvFrom_id: integer('tvFrom_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	tvTo_id: integer('tvTo_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	movieFrom_id: integer('movieFrom_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	movieTo_id: integer('movieTo_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	pk: primaryKey(db.id),
	index: index('similars_index').on(db.id, db.media_id, db.tvFrom_id, db.tvTo_id, db.movieFrom_id, db.movieTo_id),
	tvUnuque: uniqueIndex('similars_tv_unique').on(db.media_id, db.tvFrom_id),
	movieUnuque: uniqueIndex('similars_movie_unique').on(db.media_id, db.movieFrom_id),
}));

export const similarRelations = relations(similars, ({ one }) => ({
	movie_from: one(movies, {
		fields: [similars.movieFrom_id],
		references: [movies.id],
		relationName: 'movie_similar_from',
	}),
	movie_to: one(movies, {
		fields: [similars.movieTo_id],
		references: [movies.id],
		relationName: 'movie_similar_to',
	}),
	tv_from: one(tvs, {
		fields: [similars.tvFrom_id],
		references: [tvs.id],
		relationName: 'tv_similar_from',
	}),
	tv_to: one(tvs, {
		fields: [similars.tvTo_id],
		references: [tvs.id],
		relationName: 'tv_similar_to',
	}),
}));
