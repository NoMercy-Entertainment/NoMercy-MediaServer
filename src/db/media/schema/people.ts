
import { boolean, datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, index, real } from 'drizzle-orm/sqlite-core';
import { casts } from './casts';
import { crews } from './crews';
import { guestStars } from './guestStars';
import { creators } from './creators';
import { medias } from './medias';
import { translations } from './translations';
import { images } from './images';

export const people = sqliteTable('people', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	adult: boolean('adult')
		.default(false),
	alsoKnownAs: text('alsoKnownAs'),
	biography: text('biography'),
	birthday: text('birthday'),
	deathday: text('deathday'),
	gender: integer('gender').default(0),
	homepage: text('homepage'),
	imdbId: text('imdbId'),
	knownForDepartment: text('knownForDepartment'),
	name: text('name'),
	placeOfBirth: text('placeOfBirth'),
	popularity: real('popularity'),
	profile: text('profile'),
	blurHash: text('blurHash'),
	titleSort: text('titleSort'),
	colorPalette: text('colorPalette'),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
}, db => ({
	index: index('peopleIndex').on(db.id),
}));

export const peopleRelations = relations(people, ({ many }) => ({
	casts: many(casts),
	crews: many(crews),
	guestStars: many(guestStars),
	creators: many(creators),
	medias: many(medias),
	images: many(images),
	translations: many(translations),
}));
