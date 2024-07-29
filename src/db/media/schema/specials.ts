import { text, sqliteTable, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { specialItems } from './specialItems';

export const specials = sqliteTable('specials', {
	id: text('id'),
	backdrop: text('backdrop'),
	description: text('description'),
	poster: text('poster'),
	logo: text('logo'),
	title: text('title')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	creator: text('creator'),

	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

}, db => ({
	pk: primaryKey(db.id),
	index: index('specials_index')
		.on(db.id),
	unique: uniqueIndex('specials_unique')
		.on(db.title),
}));

export const specialsRelations = relations(specials, ({ many }) => ({
	specialItems: many(specialItems),
}));
