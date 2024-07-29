import { Request, Response } from 'express-serve-static-core';

import { album_user } from '@server/db/media/schema/album_user';
import { and, eq } from 'drizzle-orm';
import { albums } from '@server/db/media/schema/albums';
import { AppState, useSelector } from '@server/state/redux';

export default (req: Request, res: Response) => {

	const { id, value }: { id: string, value: boolean; } = req.body;

	const result = globalThis.mediaDb.query.albums.findFirst({
		where: eq(albums.id, id),
		with: {
			album_user: true,
		},
	});

	if (!result) {
		return null;
	}

	switch (value) {
	case true:
		globalThis.mediaDb.insert(album_user)
			.values({
				album_id: id,
				user_id: req.user.sub,
			})
			.returning()
			.get();
		break;

	default:
		globalThis.mediaDb.delete(album_user)
			.where(
				and(
					eq(album_user.user_id, req.user.sub),
					eq(album_user.album_id, id)
				)
			)
			.returning()
			.get();

		break;
	}

	const socket = useSelector((state: AppState) => state.system.socket);
	socket.emit('update_content', ['music', 'album', id, '_']);
	socket.emit('update_content', ['music', '_']);

	return res.json({
		...result,
		favorite_album: value,
	});

};
