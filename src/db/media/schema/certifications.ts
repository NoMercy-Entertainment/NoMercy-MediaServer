import { text, sqliteTable, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const certifications = sqliteTable('certifications', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	iso31661: text('iso31661').notNull(),
	meaning: text('meaning').notNull(),
	order: integer('order').notNull(),
	rating: text('rating').notNull(),
}, db => ({
	index: index('certifications_index').on(db.id),
	unique: uniqueIndex('certifications_unique').on(db.iso31661, db.rating),
}));
