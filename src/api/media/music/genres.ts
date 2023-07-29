import { Request, Response } from 'express-serve-static-core';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '@server/functions/system';
// import { generateBlurHash } from '@server/functions/createBlurHash/createBlurHash';
import { sortBy } from '@server/functions/stringArray';
import { asc } from 'drizzle-orm';
import { musicGenres } from '@server/db/media/schema/musicGenres';

export default function (req: Request, res: Response) {

	const music = globalThis.mediaDb.query.musicGenres.findMany({
		// where: {
		// 	track: {
		// 		some: {
		// 			id: {
		// 				not: undefined,
		// 			},
		// 		},
		// 	},
		// },
		with: {
			musicGenre_track: true,
		},
		orderBy: asc(musicGenres.name),
	});

	if (!music) {
		return res.json({
			status: 'error',
			message: 'No genres',
		});
	}

	const result: GenreResponse = {
		type: 'genres',
		data: sortBy(music.filter(m => m.musicGenre_track.length > 10)
			.map((m) => {
				return {
					...m,
					type: 'genre',
					name: m.name?.replace(/["'\[\]*]/gu, ''),
					titleSort: createTitleSort(m.name?.replace(/["'\[\]*]/gu, '') ?? ''),
					origin: deviceId,
					// blurHash: generateBlurHash(),
					blurHash: '',

				};
			}), 'titleSort'),
	};

	return res.json(result);
}

export interface GenreResponse {
    type: string;
    data: {
        type: string;
        name: string | undefined;
        titleSort: string;
        origin: string;
        blurHash: string;
        id: string | null;
    }[];
}
