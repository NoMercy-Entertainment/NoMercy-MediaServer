import { boolean, datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { casts } from './casts';
import { crews } from './crews';
import { recommendations } from './recommendations';
import { similars } from './similars';
import { translations } from './translations';
import { alternativeTitles } from './alternativeTitles';
import { userData } from './userData';
import { medias } from './medias';
import { specialItems } from './specialItems';
import { videoFiles } from './videoFiles';
import { files } from './files';
import { certification_movie } from './certification_movie';
import { genre_movie } from './genre_movie';
import { keyword_movie } from './keyword_movie';
import { collection_movie } from './collection_movie';
import { images } from './images';

export const movies = sqliteTable('movies', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	title: text('title')
		.notNull(),
	titleSort: text('titleSort')
		.notNull(),
	duration: text('duration'),
	show: boolean('show')
		.default(false),
	folder: text('folder'),
	adult: boolean('adult')
		.default(false),
	backdrop: text('backdrop'),
	budget: integer('budget'),
	homepage: text('homepage'),
	imdbId: text('imdbId'),
	originalTitle: text('originalTitle'),
	originalLanguage: text('originalLanguage'),
	overview: text('overview'),
	popularity: real('popularity'),
	poster: text('poster'),
	releaseDate: datetime('releaseDate')
		.notNull(),
	revenue: integer('revenue'),
	runtime: integer('runtime'),
	status: text('status'),
	tagline: text('tagline'),
	trailer: text('trailer'),
	tvdbId: integer('tvdbId'),
	video: text('video'),
	voteAverage: real('voteAverage'),
	voteCount: integer('voteCount'),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	library_id: text('library_id')
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
		.notNull(),
}, db => ({
	index: index('movie_index')
		.on(db.id),
	unique: uniqueIndex('movie_unique')
		.on(db.id),
}));

export const moviesRelations = relations(movies, ({
	many,
	one,
}) => ({
	library: one(libraries, {
		fields: [movies.library_id],
		references: [libraries.id],
	}),
	alternativeTitles: many(alternativeTitles),
	casts: many(casts),
	certification_movie: many(certification_movie),
	collection_movie: many(collection_movie),
	crews: many(crews),
	files: many(files),
	genre_movie: many(genre_movie),
	keyword_movie: many(keyword_movie),
	medias: many(medias),
	images: many(images),
	recommendation_from: many(recommendations, { relationName: 'movie_recommendations_from' }),
	recommendation_to: many(recommendations, { relationName: 'movie_recommendations_to' }),
	similar_from: many(similars, { relationName: 'movie_similar_from' }),
	similar_to: many(similars, { relationName: 'movie_similar_to' }),
	specialItems: many(specialItems),
	translations: many(translations),
	userData: many(userData),
	videoFiles: many(videoFiles),
}));
