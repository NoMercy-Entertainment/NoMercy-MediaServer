import { text, sqliteTable, integer, index, uniqueIndex, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { tvs } from './tvs';
import { seasons } from './seasons';
import { episodes } from './episodes';
import { movies } from './movies';
import { people } from './people';
import { videoFiles } from './videoFiles';

export const medias = sqliteTable('medias', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	aspectRatio: real('aspectRatio'),
	height: integer('height'),
	iso6391: text('iso6391'),
	name: text('name'),
	site: text('site'),
	size: integer('size'),
	src: text('src')
		.notNull(),
	type: text('type'),
	voteAverage: real('voteAverage'),
	voteCount: integer('voteCount'),
	width: integer('width'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	tv_id: integer('tv_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	season_id: integer('season_id')
		.references(() => seasons.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episode_id: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movie_id: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	person_id: integer('person_id')
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	videoFile_id: integer('videoFile_id')
		.references(() => videoFiles.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),

}, db => ({
	unique: uniqueIndex('medias_unique')
		.on(db.src),
	index: index('medias_index')
		.on(db.episode_id, db.movie_id, db.person_id, db.season_id, db.tv_id, db.videoFile_id),
	unique_tv: uniqueIndex('medias_tv_unique')
		.on(db.tv_id, db.src),
	unique_season: uniqueIndex('medias_season_unique')
		.on(db.season_id, db.src),
	unique_episode: uniqueIndex('medias_episode_unique')
		.on(db.episode_id, db.src),
	unique_movie: uniqueIndex('medias_movie_unique')
		.on(db.movie_id, db.src),
	unique_person: uniqueIndex('medias_person_unique')
		.on(db.person_id, db.src),
	unique_videoFile: uniqueIndex('medias_videoFile_unique')
		.on(db.videoFile_id, db.src),
}));

export const mediasRelations = relations(medias, ({ one }) => ({
	person: one(people, {
		fields: [medias.person_id],
		references: [people.id],
	}),
	movie: one(movies, {
		fields: [medias.movie_id],
		references: [movies.id],
	}),
	tv: one(tvs, {
		fields: [medias.tv_id],
		references: [tvs.id],
	}),
	season: one(seasons, {
		fields: [medias.season_id],
		references: [seasons.id],
	}),
	episode: one(episodes, {
		fields: [medias.episode_id],
		references: [episodes.id],
	}),
}));
