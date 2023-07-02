import { text, sqliteTable, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { tracks } from './tracks';

export const musicGenres = sqliteTable('musicGenres', {
	id: text('id'),
	name: text('name').notNull(),

}, db => ({
	pk: primaryKey(db.id),
	index: index('musicGenres_index').on(db.id),
	unique: uniqueIndex('musicGenres_unique').on(db.name),
}));

export const musicGenresRelations = relations(musicGenres, ({ many }) => ({
	tracks: many(tracks),
}));
