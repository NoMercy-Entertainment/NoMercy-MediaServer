
import { text, sqliteTable, uniqueIndex, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { datetime } from '../../helpers';
import { activityLogs } from './activityLogs';

export const devices = sqliteTable('devices', {
	id: text('id'),
	device_id: text('device_id').notNull(),
	browser: text('browser').notNull(),
	os: text('os').notNull(),
	device: text('device').notNull(),
	type: text('type').notNull(),
	name: text('name').notNull(),
	custom_name: text('custom_name'),
	version: text('version').notNull(),
	ip: text('ip').notNull(),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

}, db => ({
	pk: primaryKey(db.id),
	index: index('devices_index').on(db.device_id),
	unique: uniqueIndex('devices_unique').on(db.device_id, db.type, db.name, db.version),
}));

export const devicesRelations = relations(devices, ({ many }) => ({
	activityLogs: many(activityLogs),
}));
