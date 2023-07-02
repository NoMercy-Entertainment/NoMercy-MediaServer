import { sqliteTable, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { people } from './people';
import { tvs } from './tvs';
import { relations } from 'drizzle-orm';

export const creators = sqliteTable('creators', {
	person_id: integer('person_id')
		.references(() => people.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	tv_id: integer('tv_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	unique: uniqueIndex('creators_unique').on(db.person_id, db.tv_id),
}));

export const creatorsRelations = relations(creators, ({ one }) => ({
	person: one(people, {
		fields: [creators.person_id],
		references: [people.id],
	}),
	tv: one(tvs, {
		fields: [creators.tv_id],
		references: [tvs.id],
	}),
}));
