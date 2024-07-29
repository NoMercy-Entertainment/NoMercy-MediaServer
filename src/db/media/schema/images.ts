import { datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { albums } from './albums';
import { artists } from './artists';
import { casts } from './casts';
import { crews } from './crews';
import { people } from './people';
import { tracks } from './tracks';
import { episodes } from './episodes';
import { tvs } from './tvs';
import { seasons } from './seasons';
import { movies } from './movies';
import { collections } from './collections';

export const images = sqliteTable('images', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	aspectRatio: real('aspectRatio'),
	height: integer('height'),
	iso6391: text('iso6391'),
	name: text('name'),
	site: text('site'),
	size: integer('size'),
	filePath: text('filePath')
		.notNull(),
	type: text('type'),
	width: integer('width'),
	voteAverage: real('voteAverage'),
	voteCount: integer('voteCount'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	cast_id: text('cast_id')
		.references(() => casts.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	crew_id: text('crew_id')
		.references(() => crews.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	person_id: integer('person_id')
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	artist_id: text('artist_id')
		.references(() => artists.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	album_id: text('album_id')
		.references(() => albums.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	track_id: text('track_id')
		.references(() => tracks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
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
	collection_id: integer('collection_id')
		.references(() => collections.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, db => ({
	index: index('images_index')
		.on(db.episode_id, db.movie_id, db.person_id, db.season_id, db.tv_id, db.album_id, db.artist_id, db.cast_id, db.crew_id, db.collection_id, db.track_id),
	unique: uniqueIndex('images_inique')
		.on(db.filePath),
	unique_tv: uniqueIndex('images_tv_unique')
		.on(db.tv_id, db.filePath),
	unique_season: uniqueIndex('images_season_unique')
		.on(db.season_id, db.filePath),
	unique_episode: uniqueIndex('images_episode_unique')
		.on(db.episode_id, db.filePath),
	unique_movie: uniqueIndex('images_movie_unique')
		.on(db.movie_id, db.filePath),
	unique_collection: uniqueIndex('images_collection_unique')
		.on(db.collection_id, db.filePath),
	unique_person: uniqueIndex('images_person_unique')
		.on(db.person_id, db.filePath),
	unique_cast: uniqueIndex('images_cast_unique')
		.on(db.cast_id, db.filePath),
	unique_crew: uniqueIndex('images_crew_unique')
		.on(db.crew_id, db.filePath),
	unique_artist: uniqueIndex('images_artist_unique')
		.on(db.artist_id, db.filePath),
	unique_album: uniqueIndex('images_album_unique')
		.on(db.album_id, db.filePath),
	unique_track: uniqueIndex('images_track_unique')
		.on(db.track_id, db.filePath),
}));

export const imagesRelations = relations(images, ({ one }) => ({
	cast: one(casts, {
		fields: [images.cast_id],
		references: [casts.id],
	}),
	crew: one(crews, {
		fields: [images.crew_id],
		references: [crews.id],
	}),
	person: one(people, {
		fields: [images.person_id],
		references: [people.id],
	}),
	artist: one(artists, {
		fields: [images.artist_id],
		references: [artists.id],
	}),
	album: one(albums, {
		fields: [images.album_id],
		references: [albums.id],
	}),
	track: one(tracks, {
		fields: [images.track_id],
		references: [tracks.id],
	}),
	tv: one(tvs, {
		fields: [images.tv_id],
		references: [tvs.id],
	}),
	season: one(seasons, {
		fields: [images.season_id],
		references: [seasons.id],
	}),
	episode: one(episodes, {
		fields: [images.episode_id],
		references: [episodes.id],
	}),
	movie: one(movies, {
		fields: [images.movie_id],
		references: [movies.id],
	}),
	collection: one(collections, {
		fields: [images.collection_id],
		references: [collections.id],
	}),
}));
