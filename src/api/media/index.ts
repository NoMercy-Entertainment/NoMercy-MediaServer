import { Genre, Translation } from '@prisma/client';
import { Request, Response } from 'express';
import { getContent, ownerQuery, userQuery } from './data';

import { KAuthRequest } from 'types/keycloak';
import { LibraryResponseContent } from 'types/server';
import { confDb } from '../../database/config';
import { deviceId } from '../../functions/system';
import { isOwner } from '../middleware/permissions';

export default async function (req: Request, res: Response) {
	const language = req.acceptsLanguages()[0] == 'undefined'
		? 'en'
		: req.acceptsLanguages()[0].split('-')[0];

	const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	const genres: Genre[] = [];
	const response: any[] = [];
	const translations: Translation[] = [];

	await confDb.translation.findMany({
		where: {
			iso6391: language,
			translationableType: {
				in: ['movie', 'tv'],
			},
		},
	}).then(data => translations.push(...data));

	await Promise.all([

		confDb.genre.findMany({
			orderBy: {
				name: 'asc',
			},
		})
			.then(data => genres.push(...data)),

		owner && confDb.library.findMany(ownerQuery())
			.then(async (data) => {
				for (const lib of data) {
					if (!lib) continue;
					
					response.push(...(await getContent(lib, translations, servers)));					
				}
				
				// for (let i = 0; i < data.length; i++) {
				// 	const l = data[i];
				// 	response.push(...(await getContent(l, translations, servers)));
				// }
			}),

		!owner && confDb.user
			.findFirst(userQuery(user))
			.then(async (data) => {
				if (!data?.Libraries) return;

				for (const lib of data?.Libraries) {
					if (!lib.library) continue;
					
					response.push(...(await getContent(lib.library, translations, servers)));
				}

				// for (let i = 0; i < data?.Libraries.length; i++) {
				// 	const l = data?.Libraries[i];
				// 	if (!l.library) return;

				// 	response.push(...(await getContent(l.library, translations, servers)));
				// }
			}),
	]);

	const body = {};

	genres.map((g) => {
		const x: LibraryResponseContent[] = response
			.filter(d => d.genres && d.genres.map(g => g.genreId).includes(g.id))
			.map((d) => {
				return {
					id: d.id,
					backdrop: d.backdrop,
					logo: d.logo,
					overview: d.overview,
					favorite: d.favorite,
					played: d.played,
					poster: d.poster,
					title: d.title,
					titleSort: d.titleSort,
					type: d.mediaType,
					year: d.year,
					mediaType: d.mediaType,
				};
			})
			.sort(() => Math.random() - 0.5)
			.slice(0, 35);

		if (x.length > 0) {
			body[g.name] = x;
		}

	});

	return res.json(body);
}
