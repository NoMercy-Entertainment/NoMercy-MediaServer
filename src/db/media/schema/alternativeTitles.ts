
import { text, sqliteTable, integer, uniqueIndex, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { movies } from './movies';
import { tvs } from './tvs';
import { relations } from 'drizzle-orm';

export const alternativeTitles = sqliteTable('alternativeTitles', {
	id: text('id'),
	iso31661: text('iso31661').notNull(),
	title: text('title').notNull(),

	movie_id: integer('movie_id').references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	tv_id: integer('tv_id').references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	pk: primaryKey(db.id),
	movieUnique: uniqueIndex('alternative_titles_movie_unique').on(db.movie_id, db.iso31661),
	movieIndex: index('alternative_titles_movie_index').on(db.movie_id),
	tvUnique: uniqueIndex('alternative_titles_tv_unique').on(db.tv_id, db.iso31661),
	tvIndex: index('alternative_titles_tv_index').on(db.tv_id),
}));

export const alternativeTitlesRelations = relations(alternativeTitles, ({ one }) => ({
	movie: one(movies, {
		fields: [alternativeTitles.movie_id],
		references: [movies.id],
	}),
	tv: one(tvs, {
		fields: [alternativeTitles.tv_id],
		references: [tvs.id],
	}),
}));
