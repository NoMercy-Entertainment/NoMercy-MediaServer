import { Request, Response } from 'express';


export default async function (req: Request, res: Response) {
	// const { id, type, value } = req.body;

	// let data: any = <VideoFile>{};

	// if (type == 'tv') {
	// 	data = (await confDb.tv.findFirst({
	// 		where: {
	// 			id: id,
	// 		},
	// 		include: {
	// 			Episode: {
	// 				include: {
	// 					VideoFile: true,
	// 				},
	// 			},
	// 		},
	// 	}))?.Episode?.find(e => e.seasonNumber == 1 && e.episodeNumber == 1)?.VideoFile?.[0];
	// } else if (type == 'movies') {
	// 	data = (await confDb.movie.findFirst({
	// 		where: {
	// 			id: id,
	// 		},
	// 		include: {
	// 			VideoFile: true,
	// 		},
	// 	}))?.VideoFile?.[0];
	// }

	// if (!data) {
	// 	return res.status(400).json({
	// 		status: 'error',
	// 		message: `Failed to ${value
	// 			? 'add item to'
	// 			: 'remove item from'} favorites`,
	// 	});
	// }

	// confDb.userData.upsert({
	// 	where: type == 'tv'
	// 		? {
	// 			tvId_videoFileId_sub_id: {
	// 				tvId: parseInt(id, 10),
	// 				sub_id: req.user.sub,
	// 				videoFileId: data.id,
	// 			},
	// 		}
	// 		: {
	// 			movieId_videoFileId_sub_id: {
	// 				movieId: parseInt(id, 10),
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
	// 		isFavorite: value,
	// 		videoFileId: data.id,
	// 	},
	// 	update: {
	// 		tvId: type == 'tv'
	// 			? id
	// 			: undefined,
	// 		movieId: type == 'movies'
	// 			? id
	// 			: undefined,
	// 		sub_id: req.user.sub,
	// 		isFavorite: value,
	// 		videoFileId: data.id,
	// 	},
	// })
	// 	.then((data) => {
	// 		const socket = useSelector((state: AppState) => state.system.socket);
	// 		socket.emit('update_content', ['favorites']);
	// 		return res.json({
	// 			status: 'ok',
	// 			data: data,
	// 			message: `Item ${value
	// 				? 'added to'
	// 				: 'removed from'} favorites`,
	// 		});
	// 	})
	// 	.catch((error) => {
	// 		return res.status(400).json({
	// 			status: 'error',
	// 			error: error,
	// 			message: `Failed to ${value
	// 				? 'add item to'
	// 				: 'remove item from'} favorites`,
	// 		});
	// 	});


}
