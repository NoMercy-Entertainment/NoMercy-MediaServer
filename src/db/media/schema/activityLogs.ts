
import { datetime } from '../../helpers';
import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { devices } from './devices';

export const activityLogs = sqliteTable('activityLogs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	type: text('type').notNull(),
	time: datetime('time').notNull(),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	user_id: text('user_id')
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	device_id: text('device_id')
		.references(() => devices.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	user: one(users, {
		fields: [activityLogs.user_id],
		references: [users.id],
	}),
	device: one(devices, {
		fields: [activityLogs.device_id],
		references: [devices.id],
	}),
}));
