import { Request, Response } from 'express-serve-static-core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function (req: Request, res: Response) {

	// const { query, type } = req.params;

	// let result;

	// switch (type) {
	// case 'artist':
	// 	result = await confDb.artist.findMany({
	// 		where: {
	// 			name: {
	// 				contains: query,
	// 			},
	// 			NOT: {
	// 				track: {
	// 					every: {},
	// 				},
	// 			},
	// 		},
	// 		include: {
	// 			Album: true,
	// 		},
	// 	});
	// 	break;
	// case 'album':
	// 	result = await confDb.album.findMany({
	// 		where: {
	// 			OR: [
	// 				{
	// 					name: {
	// 						contains: query,
	// 					},
	// 				},
	// 				{
	// 					AND: {
	// 						NOT: {
	// 							description: {
	// 								contains: 'Various Artists',
	// 							},
	// 						},
	// 						Artist: {
	// 							some: {
	// 								name: {
	// 									contains: query,
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 			],
	// 		},
	// 	});
	// 	break;
	// case 'playlist':
	// 	result = await confDb.playlist.findMany({
	// 		where: {
	// 			userId: req.user.sub,
	// 			name: {
	// 				contains: query,
	// 			},
	// 		},
	// 	});
	// 	break;
	// default:
	// 	break;
	// }

	// const data = {
	// 	data: sortBy(unique(result?.map((t) => {
	// 		return {
	// 			...t,
	// 			type,
	// 			year: t.description?.match?.(/\((\d{4})\)/u)?.[1] ?? 9999,
	// 			title_sort: createTitleSort(t.title ?? t.name),
	// 			origin: JSON.parse((process.env.CONFIG as string)).server_id,
	// 			cover: t.cover
	// 				? t.cover
	// 				: t.album?.[0]?.cover ?? null,
	// 		};
	// 	}) ?? [], 'name'), 'year'),
	// 	type: `${type}s`,
	// };

	// res.json(data);

}
