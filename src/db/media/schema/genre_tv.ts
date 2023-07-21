import { sqliteTable, primaryKey, integer } from 'drizzle-orm/sqlite-core';
import { tvs } from './tvs';
import { relations } from 'drizzle-orm';
import { genres } from './genres';

export const genre_tv = sqliteTable('genre_tv', {
	genre_id: integer('genre_id')
		.references(() => genres.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	tv_id: integer('tv_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.genre_id, db.tv_id),
}));

export const genre_tvRelations = relations(genre_tv, ({ one }) => ({
	genre: one(genres, {
		fields: [genre_tv.genre_id],
		references: [genres.id],
	}),
	tv: one(tvs, {
		fields: [genre_tv.tv_id],
		references: [tvs.id],
	}),
}));
