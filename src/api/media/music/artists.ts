/* eslint-disable prefer-promise-reject-errors */
import { Request, Response } from 'express';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { removeDiacritics, sortBy } from '../../../functions/stringArray';
import { selectArtists } from '@/db/media/actions/artists';
import { requestWorker } from '@/api/requestWorker';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		letter: req.body.letter,
		user: req.user.sub,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);

}

export const exec = ({ letter, user }: { letter: string; user: string; }) => {
	return new Promise((resolve, reject) => {

		const music = selectArtists(letter, user);

		if (!music) {
			return reject({
				message: 'You are not authorized to access this album',
				code: 401,
			});
		}

		const results = {
			type: 'artists',
			data: sortBy(music
				.map((m) => {
					return {
						...m,
						type: 'artist',
						name: m.name.replace(/["'\[\]*]/gu, ''),
						titleSort: removeDiacritics(createTitleSort(m.name)),
						origin: deviceId,
						colorPalette: JSON.parse(m.colorPalette ?? '{}'),
					};
				}), 'titleSort'),
		};

		return resolve(results);
	});
};
