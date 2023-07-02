import { boolean, datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { activityLogs } from './activityLogs';
import { userData } from './userData';
import { notification_user } from './notification_user';
import { library_user } from './library_user';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull(),
	manage: boolean('manage').default(false),
	owner: boolean('owner').default(false),
	name: text('name').notNull(),
	allowed: boolean('allowed').default(true),
	audioTranscoding: boolean('audioTranscoding').default(true),
	videoTranscoding: boolean('videoTranscoding').default(true),
	noTranscoding: boolean('noTranscoding').default(true),
	created_at: datetime('created_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at').notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
	library_user: many(library_user),
	notification_user: many(notification_user),
	activityLogs: many(activityLogs),
	userData: many(userData),
}));
