import { text, sqliteTable, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { libraries } from './libraries';
import { collection_movie } from './collection_movie';
import { translations } from './translations';
import { images } from './images';

export const collections = sqliteTable('collections', {
	id: integer('id')
		.primaryKey({ autoIncrement: true }),
	backdrop: text('backdrop'),
	overview: text('overview'),
	parts: integer('parts'),
	poster: text('poster'),
	title: text('title')
		.notNull(),
	titleSort: text('titleSort')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),

	library_id: text('library_id')
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
		.notNull(),
}, db => ({
	index: index('collections_index')
		.on(db.id),
	unique: uniqueIndex('collections_unique')
		.on(db.backdrop, db.poster),
}));

export const collectionsRelations = relations(collections, ({
	many,
	one,
}) => ({
	collection_movie: many(collection_movie),
	translations: many(translations),
	images: many(images),
	library: one(libraries, {
		fields: [collections.library_id],
		references: [libraries.id],
	}),
}));
