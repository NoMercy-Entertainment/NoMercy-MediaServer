import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { album_user } from '../schema/album_user';

export type NewAlbumUser = InferModel<typeof album_user, 'insert'>;
export const insertAlbumUser = (data: NewAlbumUser) => globalThis.mediaDb.insert(album_user)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [album_user.album_id, album_user.user_id],
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type AlbumUser = InferModel<typeof album_user, 'select'>;
