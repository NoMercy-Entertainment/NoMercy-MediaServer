import { Request, Response } from 'express';
import { sortBy, uniqBy } from '../../../functions/stringArray';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';

export default async function (req: Request, res: Response) {

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const { query, type } = req.params;

	let data;
	let result;

	switch (type) {
	case 'artist':
		result = await confDb.artist.findMany({
			where: {
				name: {
					contains: query,
				},
				NOT: {
					Track: {
						isNot: {},
					},
				},
			},
			include: {
				Album: true,
			},
		});
		break;
	case 'album':
		result = await confDb.album.findMany({
			where: {
				OR: [
					{
						name: {
							contains: query,
						},
					},
					{
						AND: {
							NOT: {
								description: {
									contains: 'Various Artists',
								},
							},
							Artist: {
								some: {
									name: {
										contains: query,
									},
								},
							},
						},
					},
				],
			},
		});
		break;
	case 'playlist':
		result = await confDb.playlist.findMany({
			where: {
				userId: user,
				name: {
					contains: query,
				},
			},
		});
		break;
	default:
		break;
	}


	data = {
		data: sortBy(uniqBy(result?.map((t) => {
			return {
				...t,
				type,
				year: t.description?.match?.(/\((\d{4})\)/)?.[1] ?? 9999,
				title_sort: createTitleSort((t.title ?? t.name)[0].toUpperCase() + (t.title ?? t.name).slice(1)),
				origin: JSON.parse((process.env.CONFIG as string)).server_id,
				cover: t.cover ? t.cover : t.album?.[0]?.cover ?? null,
			};
		}) ?? [], 'name'), 'year'),
		type: `${type}s`,
	};

	res.json(data);

}
