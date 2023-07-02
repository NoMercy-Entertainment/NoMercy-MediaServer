import { sqliteTable, integer, index, text } from 'drizzle-orm/sqlite-core';
import { people } from './people';
import { episodes } from './episodes';
import { relations } from 'drizzle-orm';

export const guestStars = sqliteTable('guestStars', {
	id: text('id').primaryKey(),

	person_id: integer('person_id')
		.references(() => people.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	episode_id: integer('episode_id')
		.references(() => episodes.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	// role_id: integer('role_id')
	// 	.references(() => roles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	index: index('guestStars_index').on(db.episode_id),
	// unique: uniqueIndex('guestStars_unique').on(db.id, db.person_id, db.role_id),
}));

export const guestStarsRelations = relations(guestStars, ({ one }) => ({
	person: one(people, {
		fields: [guestStars.person_id],
		references: [people.id],
	}),
	episode: one(episodes, {
		fields: [guestStars.episode_id],
		references: [episodes.id],
	}),
	// role: one(roles, {
	// 	fields: [guestStars.role_id],
	// 	references: [roles.id],
	// }),
}));
