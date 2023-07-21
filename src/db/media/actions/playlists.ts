import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { playlists } from '../schema/playlists';
import { createId } from '@paralleldrive/cuid2';

export type NewPlaylist = InferModel<typeof playlists, 'insert'>;
export const insertPlaylist = (data: NewPlaylist) => globalThis.mediaDb.insert(playlists)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [playlists.user_id, playlists.id],
		set: {
			...convertBooleans(data),
			id: data.id ?? undefined,
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Playlist = InferModel<typeof playlists, 'select'>;
export const selectPlaylist = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.playlists.findMany({
			with: {
				playlist_track: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(playlists)
		.all();
};
