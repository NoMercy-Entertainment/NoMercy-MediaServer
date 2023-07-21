import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { collections } from './collections';
import { relations } from 'drizzle-orm';

export const collection_library = sqliteTable('collection_library', {
	collection_id: integer('collection_id')
		.references(() => collections.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	library_id: integer('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.collection_id, db.library_id),
}));

export const collection_libraryRelations = relations(collection_library, ({ one }) => ({
	collection: one(collections, {
		fields: [collection_library.collection_id],
		references: [collections.id],
	}),
	library: one(libraries, {
		fields: [collection_library.library_id],
		references: [libraries.id],
	}),
}));
