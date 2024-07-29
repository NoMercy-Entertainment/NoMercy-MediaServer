import { insertMusicPlays } from '@server/db/media/actions/music_plays';
import { tracks } from '@server/db/media/schema/tracks';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';

export default (req: Request, res: Response) => {

	const result = globalThis.mediaDb.query.tracks.findFirst({
		where: eq(tracks.id, req.body.id),
	});

	if (!result) {
		return null;
	}

	const status = insertMusicPlays({
		user_id: req.user.sub,
		track_id: req.body.id,
	});

	return res.json({
		status: status,
	});

};
