import { Request, Response } from 'express-serve-static-core';

import { findLyrics } from '../../../providers';
import lyricsFinder from 'lyrics-finder';
import { tracks } from '@server/db/media/schema/tracks';
import { eq } from 'drizzle-orm';
import { Track } from '@server/db/media/actions/tracks';

export default async function (req: Request, res: Response) {
	let lyrics = '';
	let song: Track = <Track>{};

	try {
		song = globalThis.mediaDb.select()
			.from(tracks)
			.where(eq(tracks.id, req.body.id))
			.get();

		if (!song?.lyrics) {
			lyrics = await findLyrics(req.body);
			if (!lyrics) {
				lyrics = await lyricsFinder(req.body.artist_track?.[0]?.name, req.body.name);
			}
		}

		if (lyrics) {
			song = globalThis.mediaDb.update(tracks)
				.set({
					lyrics,
				})
				.where(eq(tracks.id, song.id))
				.returning()
				.get();
		}

	} catch (error) {
		console.log(error);
	}

	if (lyrics == '' && !song?.lyrics) {
		return res.status(404).json({
			message: 'No Lyrics found',
		});
	}

	try {
		return res.json({
			lyrics: JSON.parse(song?.lyrics ?? lyrics ?? '{}'),
		});
	} catch (error) {
		return res.json({
			lyrics: song?.lyrics ?? lyrics,
		});
	}
}
