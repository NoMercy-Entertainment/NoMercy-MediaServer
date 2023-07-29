import { Request, Response } from 'express-serve-static-core';


export default function (req: Request, res: Response) {
	// const { id, type, value } = req.body;

	// let data: any = <VideoFile>{};

	// if (type == 'tv') {
	// 	data = globalThis.mediaDb.query.tvs.findFirst({
	// 		with: {
	// 			episodes: {
	// 				with: {
	// 					videoFiles: true,
	// 				},
	// 			},
	// 		},
	// 		where: {
	// 			id: eq(tvs.id, id as number),
	// 		},
	// 	})?.episodes?.find(e => e.seasonNumber == 1 && e.episodeNumber == 1)?.videoFiles[0];
	// } else if (type == 'movies') {
	// 	data = globalThis.mediaDb.query.movies.findFirst({
	// 		with: {
	// 			videoFiles: true,
	// 		},
	// 		where: {
	// 			id: eq(movies.id, id as number),
	// 		},
	// 	})?.videoFiles[0];
	// } else if (type == 'specials') {
	// 	data = globalThis.mediaDb.query.specials.findFirst({
	// 		with: {
	// 			videoFiles: true,
	// 		},
	// 		where: {
	// 			id: eq(tvs.id, id as number),
	// 		},
	// 	})?.videoFiles[0];
	// }

	// if (!data) {
	// 	return res.status(400).json({
	// 		status: 'error',
	// 		message: `Failed to ${value
	// 			? 'add item to'
	// 			: 'remove item from'} watched`,
	// 	});
	// }

	// confDb.userData.upsert({
	// 	where: type == 'tv'
	// 		? {
	// 			tvId_videoFileId_sub_id: {
	// 				tvId: id,
	// 				sub_id: req.user.sub,
	// 				videoFileId: data.id,
	// 			},
	// 		}
	// 		: {
	// 			movieId_videoFileId_sub_id: {
	// 				movieId: id,
	// 				sub_id: req.user.sub,
	// 				videoFileId: data.id,
	// 			},

	// 		},
	// 	create: {
	// 		tvId: type == 'tv'
	// 			? id
	// 			: undefined,
	// 		movieId: type == 'movies'
	// 			? id
	// 			: undefined,
	// 		sub_id: req.user.sub,
	// 		played: value,
	// 	},
	// 	update: {
	// 		tvId: type == 'tv'
	// 			? id
	// 			: undefined,
	// 		movieId: type == 'movies'
	// 			? id
	// 			: undefined,
	// 		sub_id: req.user.sub,
	// 		played: value,
	// 	},
	// })
	// 	.then((data) => {
	// 		return res.json({
	// 			success: true,
	// 			data: data,
	// 			message: `Item ${req.body.value
	// 				? 'added to'
	// 				: 'removed from'} watched`,
	// 		});
	// 	})
	// 	.catch((error) => {
	// 		return res.status(400).json({
	// 			success: true,
	// 			error: error,
	// 			message: `Failed to ${req.body.value
	// 				? 'add item to'
	// 				: 'remove item from'} watched`,
	// 		});
	// 	});

}
