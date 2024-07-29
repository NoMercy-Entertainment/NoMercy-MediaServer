import { datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, index } from 'drizzle-orm/sqlite-core';
import { tvs } from './tvs';
import { seasons } from './seasons';
import { casts } from './casts';
import { crews } from './crews';
import { specialItems } from './specialItems';
import { videoFiles } from './videoFiles';
import { medias } from './medias';
import { guestStars } from './guestStars';
import { files } from './files';
import { translations } from './translations';
import { images } from './images';

export const episodes = sqliteTable('episodes', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	title: text('title'),
	airDate: text('airDate'),
	episodeNumber: integer('episodeNumber')
		.notNull(),
	imdbId: text('imdbId'),
	overview: text('overview'),
	productionCode: text('productionCode'),
	seasonNumber: integer('seasonNumber')
		.notNull(),
	still: text('still'),
	tvdbId: integer('tvdbId'),
	voteAverage: integer('voteAverage'),
	voteCount: integer('voteCount'),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),

	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	tv_id: integer('tv_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
		.notNull(),
	season_id: integer('season_id')
		.references(() => seasons.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
		.notNull(),

}, db => ({
	index: index('episode_index')
		.on(db.id),
	seasonIndex: index('episode_season_index')
		.on(db.season_id),
}));

export const episodesRelations = relations(episodes, ({
	many,
	one,
}) => ({
	tv: one(tvs, {
		fields: [episodes.tv_id],
		references: [tvs.id],
	}),
	season: one(seasons, {
		fields: [episodes.season_id],
		references: [seasons.id],
	}),
	casts: many(casts),
	crews: many(crews),
	specialItems: many(specialItems),
	videoFiles: many(videoFiles),
	medias: many(medias),
	images: many(images),
	guestStars: many(guestStars),
	files: many(files),
	translations: many(translations),
}));
