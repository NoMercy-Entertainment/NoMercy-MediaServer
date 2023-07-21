import { text, sqliteTable, index, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { priority_provider } from './priority_provider';

export const providers = sqliteTable('providers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	provider_name: text('provider_name').notNull(),
	logo_path: text('logo_path'),
	display_priority: integer('display_priority').notNull(),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

}, db => ({
	index: index('providers_index').on(db.id),
}));

export const providersRelations = relations(providers, ({ many }) => ({
	priority_provider: many(priority_provider),
}));
