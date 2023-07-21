import { text, sqliteTable, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './users';
import { movies } from './movies';
import { tvs } from './tvs';
import { specials } from './specials';
import { videoFiles } from './videoFiles';

export const userData = sqliteTable('userData', {
	id: text('id'),
	rating: integer('rating'),
	played: integer('played'),
	playCount: integer('playCount'),
	isFavorite: integer('isFavorite'),
	playbackPositionTicks: integer('playbackPositionTicks'),
	lastPlayedDate: text('lastPlayedDate'),
	audio: text('audio'),
	subtitle: text('subtitle'),
	subtitleType: text('subtitleType'),
	time: integer('time'),
	type: text('type'),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	user_id: text('user_id')
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	tv_id: integer('tv_id')
		.references(() => tvs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	special_id: integer('special_id')
		.references(() => specials.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	videoFile_id: text('videoFile_id')
		.references(() => videoFiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	pk: primaryKey(db.id),
	index: index('userData_index').on(db.tv_id, db.movie_id, db.videoFile_id, db.user_id),
	unique_tv: uniqueIndex('userData_tv_unique').on(db.tv_id, db.videoFile_id, db.user_id),
	unique_movie: uniqueIndex('userData_movie_unique').on(db.movie_id, db.videoFile_id, db.user_id),
	unique_special_tv: uniqueIndex('userData_special_unique').on(db.special_id, db.movie_id, db.videoFile_id, db.user_id),
	unique_special_movie: uniqueIndex('userData_special_unique').on(db.special_id, db.tv_id, db.videoFile_id, db.user_id),
}));

export const userDataRelations = relations(userData, ({ one }) => ({
	special: one(specials, {
		fields: [userData.special_id],
		references: [specials.id],
	}),
	videoFile: one(videoFiles, {
		fields: [userData.videoFile_id],
		references: [videoFiles.id],
	}),
	movie: one(movies, {
		fields: [userData.movie_id],
		references: [movies.id],
	}),
	tv: one(tvs, {
		fields: [userData.tv_id],
		references: [tvs.id],
	}),
	user: one(users, {
		fields: [userData.user_id],
		references: [users.id],
	}),
}));
