import { text, sqliteTable, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { episodes } from './episodes';
import { movies } from './movies';
import { specials } from './specials';
import { relations } from 'drizzle-orm';
import { userData } from './userData';

export const specialItems = sqliteTable('specialItems', {
	order: integer('order'),

	special_id: text('special_id')
		.references(() => specials.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	episode_id: integer('episode_id')
		.references(() => episodes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	movie_id: integer('movie_id')
		.references(() => movies.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, db => ({
	episodeUnique: uniqueIndex('specialItem_episode_unique').on(db.special_id, db.episode_id),
	movieUnique: uniqueIndex('specialItem_movie_unique').on(db.special_id, db.movie_id),
}));

export const specialRelations = relations(specialItems, ({ one }) => ({
	special: one(specials, {
		fields: [specialItems.special_id],
		references: [specials.id],
	}),
	episode: one(episodes, {
		fields: [specialItems.episode_id],
		references: [episodes.id],
	}),
	movie: one(movies, {
		fields: [specialItems.movie_id],
		references: [movies.id],
	}),
	userData: one(userData, {
		fields: [specialItems.special_id],
		references: [userData.videoFile_id],
	}),
}));
