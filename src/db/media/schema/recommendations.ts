import { text, sqliteTable, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { tvs } from './tvs';
import { movies } from './movies';
import { relations } from 'drizzle-orm';

export const recommendations = sqliteTable('recommendations', {
	id: text('id'),
	backdrop: text('backdrop'),
	overview: text('overview'),
	poster: text('poster'),
	title: text('title')
		.notNull(),
	titleSort: text('titleSort')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	media_id: integer('media_id'),

	tvFrom_id: integer('tvFrom_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvTo_id: integer('tvTo_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieFrom_id: integer('movieFrom_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieTo_id: integer('movieTo_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),

}, db => ({
	pk: primaryKey(db.id),
	index: index('recommendations_index')
		.on(db.id, db.media_id, db.tvFrom_id, db.tvTo_id, db.movieFrom_id, db.movieTo_id),
	tvUnique: uniqueIndex('recommendations_tv_unique')
		.on(db.media_id, db.tvFrom_id),
	movieUnique: uniqueIndex('recommendations_movie_unique')
		.on(db.media_id, db.movieFrom_id),
}));

export const recommendationRelations = relations(recommendations, ({ one }) => ({
	movie_from: one(movies, {
		fields: [recommendations.movieFrom_id],
		references: [movies.id],
		relationName: 'movie_recommendations_from',
	}),
	movie_to: one(movies, {
		fields: [recommendations.movieTo_id],
		references: [movies.id],
		relationName: 'movie_recommendations_to',
	}),
	tv_from: one(tvs, {
		fields: [recommendations.tvFrom_id],
		references: [tvs.id],
		relationName: 'tv_recommendations_from',
	}),
	tv_to: one(tvs, {
		fields: [recommendations.tvTo_id],
		references: [tvs.id],
		relationName: 'tv_recommendations_to',
	}),
}));

