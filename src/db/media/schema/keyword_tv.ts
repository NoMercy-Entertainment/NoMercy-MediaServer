import { integer, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { keywords } from './keywords';
import { tvs } from './tvs';
import { relations } from 'drizzle-orm';

export const keyword_tv = sqliteTable('keyword_tv', {
	keyword_id: integer('keyword_id')
		.references(() => keywords.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	tv_id: integer('tv_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.tv_id, db.keyword_id),
}));

export const keyword_tvRelations = relations(keyword_tv, ({ one }) => ({
	keyword: one(keywords, {
		fields: [keyword_tv.keyword_id],
		references: [keywords.id],
	}),
	tv: one(tvs, {
		fields: [keyword_tv.tv_id],
		references: [tvs.id],
	}),
}));
