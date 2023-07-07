/* eslint-disable prefer-promise-reject-errors */
import { Request, Response } from 'express';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { sortBy } from '../../../functions/stringArray';
import { selectAlbums } from '@/db/media/actions/albums';
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

		const music = selectAlbums(letter, user);

		if (!music) {
			return reject({
				message: 'You are not authorized to access this album',
				code: 401,
			});
		}

		const results = {
			type: 'albums',
			data: sortBy(music.map((m) => {
				return {
					...m,
					type: 'album',
					name: m.name?.replace(/["'\[\]*]/gu, ''),
					titleSort: createTitleSort(m.name?.replace(/["'\[\]*]/gu, '') ?? ''),
					origin: deviceId,
					colorPalette: JSON.parse(m.colorPalette ?? '{}'),
				};
			}), 'titleSort'),
		};

		return resolve(results);
	});
};
