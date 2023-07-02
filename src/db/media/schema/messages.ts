import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { boolean } from '../../helpers';

export const messages = sqliteTable('messages', {
	id: text('id'),
	body: text('body'),
	from: text('from'),
	image: text('image'),
	notify: boolean('notify').default(false),
	read: boolean('read').default(false),
	title: text('title'),
	to: text('to'),
	type: text('type'),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
}, db => ({
	pk: primaryKey(db.id),
}));
