import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';

export default async function (req: Request, res: Response) {

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	const array: any[] = [];

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
			include: {
				Media: {
					orderBy: {
						voteAverage: 'desc',
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
			include: {
				Media: {
					orderBy: {
						voteAverage: 'desc',
					},
				},
			},
		}).then(data => array.push(...data.map(t => ({ ...t, userData: userData.find(u => u.movieId) })))),
	]);

	const data = array.map(d => ({
		id: d.id,
		mediaType: d.mediaType ?? 'movies',
		poster: d.poster,
		backdrop: d.backdrop,
		logo: d.Media.find(m => m.type == 'logo')?.src ?? null,
		title: d.title[0].toUpperCase() + d.title.slice(1),
		titleSort: createTitleSort(d.title),
		blurHash: d.blurHash ? JSON.parse(d.blurHash) : null,
		type: d.mediaType
			? 'tv'
			: 'movies',
	}));

	return res.json(data);

}
