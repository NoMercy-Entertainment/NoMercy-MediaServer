/* eslint-disable prefer-promise-reject-errors */
import { Request, Response } from 'express-serve-static-core';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '@server/functions/system';
import { sortBy, unique } from '@server/functions/stringArray';
import { selectAlbums } from '@server/db/media/actions/albums';
import { requestWorker } from '@server/api/requestWorker';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		letter: req.body.letter,
		user: req.user.sub,
	});

	if (result.error) {
		return res.status(500).json({
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
			data: sortBy(unique(music.map((m) => {
				return {
					...m,
					type: 'album',
					name: m.name?.replace(/["'\[\]*]/gu, ''),
					titleSort: createTitleSort(m.name?.replace(/["'\[\]*]/gu, '') ?? ''),
					origin: deviceId,
					colorPalette: JSON.parse(m.colorPalette ?? '{}'),
				};
			}), 'titleSort'), 'titleSort'),
		};

		return resolve(results);
	});
};

export interface AlbumsResponse {
    type: string;
    data: AlbumData[];
}

interface AlbumData {
    id: string;
    name: string;
    description: string | null;
    folder: string | null;
    cover: null | string;
    country: null | string;
    year: number | null;
    tracks: number | null;
    colorPalette: null | string;
    blurHash: null | string;
    libraryId: string;
    Artist: Artist[];
    _count: Count;
    type: string;
    titleSort: string;
    origin: string;
}

interface Artist {
    id: string;
    name: string;
    description: string | null;
    cover: null | string;
    folder: string | null;
    colorPalette: null | string;
    blurHash: null | string;
    libraryId: string;
    trackId: string | null;
}

interface Count {
    track: number;
    Artist: number;
    File: number;
}
