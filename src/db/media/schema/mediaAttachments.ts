import { text, sqliteTable, integer, index, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { files } from './files';

export const mediaAttachments = sqliteTable('mediaAttachments', {
	id: text('id'),
	type: integer('type').notNull(),
	value: text('value').notNull(),
	cleanValue: text('cleanValue').notNull(),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	file_id: text('file_id')
		.references(() => files.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.id),
	index: index('media_attachments_index').on(db.id, db.type, db.cleanValue),
	index2: index('media_attachments_index2').on(db.id, db.type, db.value),
	unique: uniqueIndex('media_attachments_unique').on(db.type),
}));

export const mediaAttachmentsRelations = relations(mediaAttachments, ({ one }) => ({
	file: one(files, {
		fields: [mediaAttachments.file_id],
		references: [files.id],
	}),
}));
