import { datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, index } from 'drizzle-orm/sqlite-core';
import { tvs } from './tvs';
import { casts } from './casts';
import { crews } from './crews';
import { episodes } from './episodes';
import { medias } from './medias';
import { translations } from './translations';
import { images } from './images';

export const seasons = sqliteTable('seasons', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	title: text('title'),
	airDate: text('airDate'),
	episodeCount: integer('episodeCount'),
	overview: text('overview'),
	poster: text('poster'),
	seasonNumber: integer('seasonNumber')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),

	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	tv_id: integer('tv_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
		.notNull(),
}, db => ({
	index: index('seasonIndex')
		.on(db.id),
	tvIndex: index('tvId_idx')
		.on(db.tv_id),
}));

export const seasonsRelations = relations(seasons, ({
	many,
	one,
}) => ({
	casts: many(casts),
	crews: many(crews),
	episodes: many(episodes),
	medias: many(medias),
	images: many(images),
	translations: many(translations),
	tv: one(tvs, {
		fields: [seasons.tv_id],
		references: [tvs.id],
	}),
}));
