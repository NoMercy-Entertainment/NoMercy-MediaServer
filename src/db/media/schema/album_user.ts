import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { albums } from './albums';
import { users } from './users';
import { relations, sql } from 'drizzle-orm';

export const album_user = sqliteTable('album_user', {
	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),

	album_id: text('album_id')
		.references(() => albums.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	user_id: text('user_id')
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.album_id, db.user_id),
}));

export const album_userRelations = relations(album_user, ({ one }) => ({
	album: one(albums, {
		fields: [album_user.album_id],
		references: [albums.id],
	}),
	user: one(users, {
		fields: [album_user.user_id],
		references: [users.id],
	}),
}));
