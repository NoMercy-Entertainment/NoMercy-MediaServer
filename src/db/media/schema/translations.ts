import { text, sqliteTable, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { tvs } from './tvs';
import { seasons } from './seasons';
import { episodes } from './episodes';
import { movies } from './movies';
import { collections } from './collections';
import { people } from './people';

export const translations = sqliteTable('translations', {
	id: text('id'),
	iso31661: text('iso31661').notNull(),
	iso6391: text('iso6391').notNull(),
	name: text('name'),
	englishName: text('englishName'),
	title: text('title'),
	overview: text('overview'),
	homepage: text('homepage'),
	biography: text('biography'),

	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	tv_id: integer('tv_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	season_id: integer('season_id')
		.references(() => seasons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	episode_id: integer('episode_id')
		.references(() => episodes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	collection_id: integer('collection_id')
		.references(() => collections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	person_id: integer('person_id')
		.references(() => people.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	pk: primaryKey(db.id),
	index: index('translations_index').on(db.episode_id, db.movie_id, db.person_id, db.season_id, db.tv_id),
	unique_tv: uniqueIndex('translations_tv_unique').on(db.tv_id, db.iso31661, db.iso6391),
	unique_season: uniqueIndex('translations_season_unique').on(db.season_id, db.iso31661, db.iso6391),
	unique_episode: uniqueIndex('translations_episode_unique').on(db.episode_id, db.iso31661, db.iso6391),
	unique_movie: uniqueIndex('translations_movie_unique').on(db.movie_id, db.iso31661, db.iso6391),
	unique_collection: uniqueIndex('translations_collection_unique').on(db.collection_id, db.iso31661, db.iso6391),
	unique_person: uniqueIndex('translations_person_unique').on(db.person_id, db.iso31661, db.iso6391),
}));

export const translationsRelations = relations(translations, ({ one }) => ({
	tv: one(tvs, {
		fields: [translations.tv_id],
		references: [tvs.id],
	}),
	season: one(seasons, {
		fields: [translations.season_id],
		references: [seasons.id],
	}),
	episode: one(episodes, {
		fields: [translations.episode_id],
		references: [episodes.id],
	}),
	movie: one(movies, {
		fields: [translations.movie_id],
		references: [movies.id],
	}),
	collection: one(collections, {
		fields: [translations.collection_id],
		references: [collections.id],
	}),
	person: one(people, {
		fields: [translations.person_id],
		references: [people.id],
	}),
}));
