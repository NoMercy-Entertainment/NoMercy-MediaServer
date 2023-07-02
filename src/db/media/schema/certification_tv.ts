import { text, sqliteTable, primaryKey, integer } from 'drizzle-orm/sqlite-core';
import { tvs } from './tvs';
import { certifications } from './certifications';
import { relations } from 'drizzle-orm';

export const certification_tv = sqliteTable('certification_tv', {
	iso31661: text('iso31661'),

	certification_id: integer('certification_id')
		.references(() => certifications.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	tv_id: integer('tv_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.iso31661, db.certification_id, db.tv_id),
}));

export const certification_tvRelations = relations(certification_tv, ({ one }) => ({
	certification: one(certifications, {
		fields: [certification_tv.certification_id],
		references: [certifications.id],
	}),
	tv: one(tvs, {
		fields: [certification_tv.tv_id],
		references: [tvs.id],
	}),
}));
