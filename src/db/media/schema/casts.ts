import { relations } from 'drizzle-orm';
import { sqliteTable, integer, uniqueIndex, text, index } from 'drizzle-orm/sqlite-core';
import { episodes } from './episodes';
import { images } from './images';
import { movies } from './movies';
import { people } from './people';
import { roles } from './roles';
import { seasons } from './seasons';
import { tvs } from './tvs';

export const casts = sqliteTable('casts', {
	id: text('id').primaryKey(),

	person_id: integer('person_id')
		.references(() => people.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	tv_id: integer('tv_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	season_id: integer('season_id')
		.references(() => seasons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	episode_id: integer('episode_id')
		.references(() => episodes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	index: index('casts_index').on(db.person_id, db.movie_id, db.tv_id, db.season_id, db.episode_id),
	movieUnique: uniqueIndex('cast_movie_unique').on(db.id, db.movie_id),
	tvUnique: uniqueIndex('cast_tv_unique').on(db.id, db.tv_id),
	seasonUnique: uniqueIndex('cast_seasons_unique').on(db.id, db.season_id),
	episodeUnique: uniqueIndex('cast_episodes_unique').on(db.id, db.episode_id),
	personUnique: uniqueIndex('cast_persons_unique').on(db.id, db.person_id),
}));

export const castsRelations = relations(casts, ({ many, one }) => ({
	person: one(people, {
		fields: [casts.person_id],
		references: [people.id],
	}),
	movie: one(movies, {
		fields: [casts.movie_id],
		references: [movies.id],
	}),
	tv: one(tvs, {
		fields: [casts.tv_id],
		references: [tvs.id],
	}),
	season: one(seasons, {
		fields: [casts.season_id],
		references: [seasons.id],
	}),
	episode: one(episodes, {
		fields: [casts.episode_id],
		references: [episodes.id],
	}),
	images: many(images),
	roles: many(roles, { relationName: 'cast_roles' }),
}));
