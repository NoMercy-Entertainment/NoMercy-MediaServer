import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { users } from './users';
import { relations } from 'drizzle-orm';

export const library_user = sqliteTable('library_user', {
	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	user_id: text('user_id')
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.library_id, db.user_id),
}));

export const library_userRelations = relations(library_user, ({ one }) => ({
	library: one(libraries, {
		fields: [library_user.library_id],
		references: [libraries.id],
	}),
	user: one(users, {
		fields: [library_user.user_id],
		references: [users.id],
	}),
}));
