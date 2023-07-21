import { text, sqliteTable, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { episodes } from './episodes';
import { movies } from './movies';
import { userData } from './userData';

export const videoFiles = sqliteTable('videoFiles', {
	id: text('id'),
	duration: text('duration'),
	filename: text('filename').notNull(),
	folder: text('folder').notNull(),
	hostFolder: text('hostFolder').notNull(),
	languages: text('languages'),
	quality: text('quality'),
	share: text('share')
		.notNull()
		.default('Media'),
	subtitles: text('subtitles'),
	chapters: text('chapters'),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	episode_id: integer('episode_id')
		.references(() => episodes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

}, db => ({
	pk: primaryKey(db.id),
	index: index('videoFiles_index').on(db.id),
	unique: uniqueIndex('videoFiles_unique').on(db.filename),
}));

export const videoFilesRelations = relations(videoFiles, ({ one, many }) => ({
	episode: one(episodes, {
		fields: [videoFiles.episode_id],
		references: [episodes.id],
	}),
	movie: one(movies, {
		fields: [videoFiles.movie_id],
		references: [movies.id],
	}),
	userData: many(userData),
}));
