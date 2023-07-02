/* eslint-disable indent */

import { Request, Response } from 'express';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { getLanguage } from '../../middleware';
import { mediaDb } from '@/db/media';
import { collections } from '@/db/media/schema/collections';
import { translations } from '@/db/media/schema/translations';
import { and, eq, gt, or, isNull, asc } from 'drizzle-orm';
import { KAuthRequest } from '@/types/keycloak';
import { movies } from '@/db/media/schema/movies';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const user = (req as unknown as KAuthRequest).token.content.sub;

	const collection = mediaDb.query.collections.findFirst({
		where: and(
			eq(collections.id, parseInt(req.params.id, 10)),
			gt(collections.parts, 0)
		),
		with: {
			collection_movie: {
				columns: {},
				with: {
					movie: {
						with: {
							library: {
								with: {
									library_user: true,
								},
							},
						},
						orderBy: asc(movies.releaseDate),
					},
				},
			},
			translations: {
				where: or(
					eq(translations.iso6391, language),
					isNull(translations.iso6391)
				),
			},
		},
	});

	return res.json(getContent(collection, user));
}

const getContent = (data: any, user: string) => {

	const title = data.translations?.title || data.title;
	const overview = data.translations?.overview || data.overview;

	const userData = data.collection_movie?.[0]?.movie?.[0]?.userData?.[0];

	const response = {
		id: data.id,
		overview: overview,
		backdrop: data.backdrop,
		poster: data.poster,
		title: title[0].toUpperCase() + title.slice(1),
		titleSort: createTitleSort(title),
		type: 'movie',
		mediaType: 'movie',
		favorite: userData?.isFavorite ?? false,
		watched: userData?.played ?? false,
		blurHash: data.blurHash
			? JSON.parse(data.blurHash)
			: null,
		colorPalette: data.colorPalette
			? JSON.parse(data.colorPalette)
			: null,
		collection: data.collection_movie?.map((c) => {
			if (!c.movie || !c.movie?.library.library_user.some(u => u.user_id == user)) return;

			return {
				id: c.movie?.id,
				backdrop: c.movie?.backdrop,
				mediaType: 'movie',
				poster: c.movie?.poster,
				title: c.movie?.title?.[0].toUpperCase() + c.movie?.title?.slice(1) ?? '',
				titleSort: createTitleSort(c.movie?.title, c.movie?.releaseDate),
				type: 'movie',
				releaseDate: c.movie?.releaseDate,
				logo: c.movie?.[0]?.Media?.find(m => m.type == 'logo')?.src,
				blurHash: c.movie?.blurHash
					? JSON.parse(c.movie?.blurHash)
					: null,
				colorPalette: c.movie?.colorPalette
					? JSON.parse(c.movie?.colorPalette)
					: null,
			};
		}).sort((a, b) => a.releaseDate.localeCompare(b.releaseDate)) ?? [],
	};

	return response;
};
