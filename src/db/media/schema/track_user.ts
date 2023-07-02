import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { tracks } from './tracks';
import { users } from './users';
import { relations, sql } from 'drizzle-orm';

export const track_user = sqliteTable('track_user', {
	created_at: text('created_at')
		.default(sql`datetime('now')`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`datetime('now')`)
		.notNull(),

	track_id: text('track_id')
		.references(() => tracks.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	user_id: text('user_id')
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.track_id, db.user_id),
}));

export const track_userRelations = relations(track_user, ({ one }) => ({
	track: one(tracks, {
		fields: [track_user.track_id],
		references: [tracks.id],
	}),
	user: one(users, {
		fields: [track_user.user_id],
		references: [users.id],
	}),
}));
