import { text, sqliteTable, index, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { libraries } from './libraries';

export const metadata = sqliteTable('metadata', {
	id: text('id'),
	title: text('title').notNull(),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.id),
	index: index('metadata_index').on(db.id),
	unique: uniqueIndex('metadata_unique').on(db.title),
}));

export const metadataRelations = relations(metadata, ({ one }) => ({
	library: one(libraries, {
		fields: [metadata.library_id],
		references: [libraries.id],
	}),
}));
