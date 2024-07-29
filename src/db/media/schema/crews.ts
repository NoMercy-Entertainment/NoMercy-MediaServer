
import { sqliteTable, integer, uniqueIndex, text } from 'drizzle-orm/sqlite-core';
import { movies } from './movies';
import { tvs } from './tvs';
import { seasons } from './seasons';
import { episodes } from './episodes';
import { people } from './people';
import { images } from './images';
import { relations } from 'drizzle-orm';
import { jobs } from './jobs';

export const crews = sqliteTable('crews', {
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
	movieUnique: uniqueIndex('crews_movie_unique').on(db.id, db.person_id, db.movie_id),
	tvUnique: uniqueIndex('crews_tv_unique').on(db.id, db.person_id, db.tv_id),
	seasonUnique: uniqueIndex('crews_seasons_unique').on(db.id, db.person_id, db.season_id),
	episodeUnique: uniqueIndex('crews_episodes_unique').on(db.id, db.person_id, db.episode_id),
}));

export const crewsRelations = relations(crews, ({ one, many }) => ({
	person: one(people, {
		fields: [crews.person_id],
		references: [people.id],
	}),
	movie: one(movies, {
		fields: [crews.movie_id],
		references: [movies.id],
	}),
	tv: one(tvs, {
		fields: [crews.tv_id],
		references: [tvs.id],
	}),
	season: one(seasons, {
		fields: [crews.season_id],
		references: [seasons.id],
	}),
	episode: one(episodes, {
		fields: [crews.episode_id],
		references: [episodes.id],
	}),
	images: many(images),
	jobs: many(jobs),
}));
