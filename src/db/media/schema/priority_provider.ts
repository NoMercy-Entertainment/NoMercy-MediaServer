import { text, sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { providers } from './providers';

export const priority_provider = sqliteTable('priority_provider', {
	priority: integer('priority').notNull(),
	country: text('country').notNull(),

	provider_id: integer('provider_id')
		.references(() => providers.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.provider_id, db.country),
}));

export const priority_providerRelations = relations(priority_provider, ({ one }) => ({
	provider: one(providers, {
		fields: [priority_provider.provider_id],
		references: [providers.id],
	}),
}));
