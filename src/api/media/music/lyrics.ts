import { Request, Response } from 'express';

import { confDb } from '../../../database/config';
import { findLyrics } from '../../../providers';
import lyricsFinder from 'lyrics-finder';

export default async function (req: Request, res: Response) {
	let lyrics = '';
	let song;

	try {
		song = await confDb.track.findFirst({
			where: {
				id: req.body.id,
			},
		});

		if (!song?.lyrics) {
			lyrics = await findLyrics(req.body);
			if (!lyrics) {
				lyrics = await lyricsFinder(req.body.artists?.[0]?.name, req.body.name);
			}
		}

		if (lyrics) {
			song = await confDb.track.update({
				data: {
					lyrics,
				},
				where: {
					id: req.body.id,
				},
			});
		}

	} catch (error) {
		console.log(error);
	}

	if (lyrics == '' && !song?.lyrics) {
		return res.json({
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
