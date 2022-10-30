import { Request, Response } from 'express';

import { Song } from '../../../types/music';
import { confDb } from '../../../database/config';
import lyricsFinder from 'lyrics-finder';

export default async function (req: Request, res: Response) {
	const request = req.query.song as unknown as Song;
	let lyrics = '';
	let song;

	try {
		song = await confDb.track.findFirst({
			where: {
				id: request.id,
			},
		});

		if (!song?.lyrics) {
			lyrics = await lyricsFinder(request.artist.name, request.name);
		}

		if (lyrics) {
			song = await confDb.track.update({
				data: {
					lyrics,
				},
				where: {
					id: request.id,
				},
			});
		}

	} catch (error) {

	}

	if (lyrics == '' && song?.lyrics) {
		return res.json({
			message: 'No Lyrics found',
		});
	}

	return res.json({
		lyrics: lyrics ?? song?.lyrics,
	});

}
