
import { datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { casts } from './casts';
import { guestStars } from './guestStars';

export const roles = sqliteTable('roles', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	credit_id: text('credit_id')
		.notNull(),
	character: text('character')
		.notNull(),
	episodeCount: integer('episodeCount'),

	created_at: datetime('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: datetime('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	cast_id: text('cast_id')
		.references(() => casts.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	guest_id: text('guest_id')
		.references(() => guestStars.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	index: index('roles_index').on(db.id),
	rolesUnique: uniqueIndex('roles_role_unique').on(db.credit_id, db.cast_id),
	guestUnique: uniqueIndex('roles_guest_unique').on(db.credit_id, db.guest_id),
}));

export const rolesRelations = relations(roles, ({ one }) => ({
	cast: one(casts, {
		fields: [roles.cast_id],
		references: [casts.id],
		relationName: 'cast_roles',
	}),
	guest: one(guestStars, {
		fields: [roles.guest_id],
		references: [guestStars.id],
		relationName: 'guest_roles',
	}),
}));
