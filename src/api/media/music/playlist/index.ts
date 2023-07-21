import { Request, Response } from 'express';


export default function (req: Request, res: Response) {
	try {

		// const music = await confDb.playlist.findMany({
		// 	where: {
		// 		userId: req.user.sub,
		// 	},
		// 	include: {
		// 		PlaylistTrack: {
		// 			include: {
		// 				track: {
		// 					include: {
		// 						Album: {
		// 							include: {
		// 								Library: true,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 		_count: {
		// 			select: {
		// 				PlaylistTrack: true,
		// 			},
		// 		},
		// 	},
		// });

		// if (music) {

		// 	const library = await confDb.library.findFirst({
		// 		where: {
		// 			type: 'music',
		// 		},
		// 		include: {
		// 			Folders: {
		// 				include: {
		// 					folder: true,
		// 				},
		// 			},
		// 		},
		// 	});

		// 	const result = {
		// 		type: 'playlists',
		// 		data: music.map((m) => {

		// 			// TODO: playlist image data url

		// 			// const imagePath = `${library!.Folders[0].folder?.path}/${m.cover}`;

		// 			// const file = readFileSync(imagePath) ?? null;
		// 			// const cover = file ? createDataImageURL(file, "image/jpeg") : null;

		// 			return {
		// 				...m,
		// 				origin: deviceId,
		// 				type: 'playlist',
		// 				// path: 'images/',
		// 				cover: m.cover,
		// 			};
		// 		}),
		// 	};

		// 	return res.json(result);
		// }
	} catch (error) {
		console.log(error);
	}

	return res.json({});
}
