
import { boolean, datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { alternativeTitles } from './alternativeTitles';
import { casts } from './casts';
import { crews } from './crews';
import { medias } from './medias';
import { recommendations } from './recommendations';
import { similars } from './similars';
import { translations } from './translations';
import { userData } from './userData';
import { seasons } from './seasons';
import { keyword_tv } from './keyword_tv';
import { episodes } from './episodes';
import { images } from './images';
import { certification_tv } from './certification_tv';
import { genre_tv } from './genre_tv';

export const tvs = sqliteTable('tvs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	titleSort: text('titleSort').notNull(),
	haveEpisodes: integer('haveEpisodes'),
	folder: text('folder'),
	backdrop: text('backdrop'),
	created_at: datetime('created_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	duration: integer('duration'),
	firstAirDate: text('firstAirDate'),
	homepage: text('homepage'),
	imdbId: text('imdbId'),
	inProduction: boolean('inProduction')
		.default(false),
	lastEpisodeToAir: integer('lastEpisodeToAir'),
	lastAirDate: text('lastAirDate'),
	mediaType: text('mediaType'),
	nextEpisodeToAir: integer('nextEpisodeToAir'),
	numberOfEpisodes: integer('numberOfEpisodes')
		.default(0),
	numberOfSeasons: integer('numberOfSeasons')
		.default(0),
	originCountry: text('originCountry'),
	originalLanguage: text('originalLanguage'),
	overview: text('overview'),
	popularity: real('popularity'),
	poster: text('poster'),
	spokenLanguages: text('spokenLanguages'),
	status: text('status'),
	tagline: text('tagline'),
	trailer: text('trailer'),
	tvdbId: integer('tvdbId'),
	type: text('type'),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	voteAverage: real('voteAverage'),
	voteCount: integer('voteCount'),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),

	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	index: index('tvIndex').on(db.id),
	unique: uniqueIndex('tvUnique').on(db.id),
}));

export const tvsRelations = relations(tvs, ({ many, one }) => ({
	library: one(libraries, {
		fields: [tvs.library_id],
		references: [libraries.id],
	}),
	alternativeTitles: many(alternativeTitles),
	casts: many(casts),
	certification_tv: many(certification_tv),
	crews: many(crews),
	genre_tv: many(genre_tv),
	keyword_tv: many(keyword_tv),
	medias: many(medias),
	images: many(images),
	recommendation_from: many(recommendations, { relationName: 'tv_recommendations_from' }),
	recommendation_to: many(recommendations, { relationName: 'tv_recommendations_to' }),
	seasons: many(seasons),
	similar_from: many(similars, { relationName: 'tv_similar_from' }),
	similar_to: many(similars, { relationName: 'tv_similar_to' }),
	translations: many(translations),
	userData: many(userData),
	episodes: many(episodes),
}));
