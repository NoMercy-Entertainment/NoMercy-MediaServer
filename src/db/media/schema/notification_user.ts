import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { notifications } from './notifications';
import { relations } from 'drizzle-orm';

export const notification_user = sqliteTable('notification_user', {
	notification_id: text('notification_id')
		.references(() => notifications.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	user_id: text('user_id')
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.notification_id, db.user_id),
}));

export const notification_userRelations = relations(notification_user, ({ one }) => ({
	notification: one(notifications, {
		fields: [notification_user.notification_id],
		references: [notifications.id],
	}),
	user: one(users, {
		fields: [notification_user.user_id],
		references: [users.id],
	}),
}));
