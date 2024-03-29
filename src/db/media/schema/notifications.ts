import { text, sqliteTable, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { boolean } from '@server/db/helpers';
import { notification_user } from './notification_user';

export const notifications = sqliteTable('notifications', {
	id: text('id'),
	name: text('name').notNull(),
	manage: boolean('manage').notNull(),

}, db => ({
	pk: primaryKey(db.id),
	index: index('notifications_index').on(db.id),
	unique: uniqueIndex('notifications_unique').on(db.name),
}));

export const notificationsRelations = relations(notifications, ({ many }) => ({
	notification_user: many(notification_user),
}));
