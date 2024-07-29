import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { artists } from './artists';
import { users } from './users';
import { relations, sql } from 'drizzle-orm';

export const artist_user = sqliteTable('artist_user', {
	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	artist_id: text('artist_id')
		.references(() => artists.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	user_id: text('user_id')
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.artist_id, db.user_id),
}));

export const artist_userRelations = relations(artist_user, ({ one }) => ({
	artist: one(artists, {
		fields: [artist_user.artist_id],
		references: [artists.id],
	}),
	user: one(users, {
		fields: [artist_user.user_id],
		references: [users.id],
	}),
}));
