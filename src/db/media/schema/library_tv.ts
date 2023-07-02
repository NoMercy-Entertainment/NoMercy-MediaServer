import { text, sqliteTable, primaryKey, integer } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { tvs } from './tvs';
import { relations } from 'drizzle-orm';

export const library_tv = sqliteTable('library_tv', {
	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	tv_id: integer('tv_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.library_id, db.tv_id),
}));

export const library_tvRelations = relations(library_tv, ({ one }) => ({
	library: one(libraries, {
		fields: [library_tv.library_id],
		references: [libraries.id],
	}),
	tv: one(tvs, {
		fields: [library_tv.tv_id],
		references: [tvs.id],
	}),
}));
