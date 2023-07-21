import { text, sqliteTable, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { folder_library } from './folder_library';
import { tracks } from './tracks';

export const folders = sqliteTable('folders', {
	id: text('id'),
	path: text('path'),

	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

}, db => ({
	pk: primaryKey(db.id),
	index: index('folders_index').on(db.id),
	unique: uniqueIndex('folders_unique').on(db.path),
}));

export const foldersRelations = relations(folders, ({ many, one }) => ({
	folder_library: many(folder_library),
	track: one(tracks, {
		fields: [folders.id],
		references: [tracks.folder_id],
	}),
}));
