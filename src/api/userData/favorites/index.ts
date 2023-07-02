import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';

export default async function (req: Request, res: Response) {

	const user = (req as unknown as KAuthRequest).token.content.sub;

	const array: any[] = [];

	const cursorQuery = (req.body.page as number) ?? undefined;
	const skip = cursorQuery
		? 1
		: 0;
	const cursor = cursorQuery
		? { id: cursorQuery }
		: undefined;

	const userData = await confDb.userData.findMany({
		where: {
			sub_id: user,
			NOT: {
				isFavorite: null,
			},
		},
		orderBy: {
			updatedAt: 'desc',
		},
	});

	await Promise.all([
		confDb.tv.findMany({
			where: {
				id: {
					in: userData.filter(u => u.tvId).map(u => u.tvId!) ?? [],
				},
			},
			skip,
			take: req.body.take,
			cursor,
			include: {
				Media: {
					orderBy: {
						voteAverage: 'desc',
					},
				},
				Season: {
					orderBy: {
						seasonNumber: 'asc',
					},
					include: {
						Episode: {
							orderBy: {
								episodeNumber: 'asc',
							},
							include: {
								VideoFile: true,
							},
						},
					},
				},
			},
		}).then(data => array.push(...data.map(t => ({ ...t, userData: userData.find(u => u.tvId) })))),
		confDb.movie.findMany({
			where: {
				id: {
					in: userData.filter(u => u.movieId).map(u => u.movieId!) ?? [],
				},
			},
			skip,
			take: req.body.take,
			cursor,
			include: {
				Media: {
					orderBy: {
						voteAverage: 'desc',
					},
				},
			},
		}).then(data => array.push(...data.map(t => ({ ...t, userData: userData.find(u => u.movieId) })))),
	]);

	const data = array.map((d) => {

		const files = d
			? [
				...d.Season.filter(t => t.seasonNumber > 0)
					.map(s => s.Episode.map(e => e.VideoFile).flat())
					.flat()
					.map(f => f.episodeId),
				// ...external?.find(t => t.id == tv.id && t.files)?.files ?? [],
			]
			: [];

		return {
			id: d.id,
			mediaType: d.mediaType ?? 'movies',
			poster: d.poster,
			backdrop: d.backdrop,
			logo: d.Media.find(m => m.type == 'logo')?.src ?? null,
			title: d.title[0].toUpperCase() + d.title.slice(1),
			titleSort: createTitleSort(d.title),
			numberOfEpisodes: d.numberOfEpisodes ?? undefined,
			haveEpisodes: files.length ?? undefined,
			colorPalette: d.colorPalette
				? JSON.parse(d.colorPalette ?? '{}')
				: null,
			blurHash: d.blurHash
				? JSON.parse(d.blurHash)
				: null,
			type: d.mediaType
				? 'tv'
				: 'movies',
		};
	});

	const nextId = data.length < req.body.take
		? undefined
		: data[req.body.take - 1]?.id;

	return res.json({
		nextId: nextId,
		data: data,
	});

}
