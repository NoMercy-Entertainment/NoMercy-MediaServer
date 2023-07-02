import { text, sqliteTable, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { datetime } from '@/db/helpers';
import { encoderProfile_library } from './encoderProfile_library';

export const encoderProfiles = sqliteTable('encoderProfiles', {
	id: text('id'),
	name: text('name').notNull(),
	container: text('container'),
	param: text('param'),

	created_at: datetime('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	updated_at: datetime('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

}, db => ({
	pk: primaryKey(db.id),
	index: index('encoderProfiles_index').on(db.id),
	unique: uniqueIndex('encoderProfiles_unique').on(db.name),
}));

export const encoderProfilesRelations = relations(encoderProfiles, ({ many }) => ({
	encoderProfile_library: many(encoderProfile_library),
}));
