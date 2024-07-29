/* eslint-disable prefer-promise-reject-errors */
import { Request, Response } from 'express-serve-static-core';
import { sortBy } from '@server/functions/stringArray';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '@server/functions/system';
import { requestWorker } from '@server/api/requestWorker';
import { selectAlbums } from '@server/db/media/actions/albums';

export default async function(req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		letter: req.body.letter,
		user: req.user.sub,
	});

	if (result.error) {
		return res.status(500)
			.json({
				status: 'error',
				message: result.error.message,
			});
	}
	return res.json(result.result);

}

export const exec = ({
	letter,
	user,
}: { letter: string; user: string; }) => {
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
					titleSort: createTitleSort(m.name?.replace(/["'\[\]*]/gu, '') ?? '', m.year),
					origin: deviceId,
					color_palette: JSON.parse(m.colorPalette ?? '{}'),
					tracks: m.album_track?.length,
				};
			}), 'titleSort'),
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
	color_palette: string | null;
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
	color_palette: string | null;
	blurHash: null | string;
	libraryId: string;
	trackId: string | null;
}

interface Count {
	track: number;
	Artist: number;
	File: number;
}
