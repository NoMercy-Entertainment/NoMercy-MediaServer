import { Request, Response } from 'express';

// import { imageHash } from 'image-hash';

export default function (req: Request, res: Response) {

	try {
		// const music = await confDb.playlist.findFirst({
		// 	where: {
		// 		userId: req.user.sub,
		// 		id: req.params.id,
		// 	},
		// });

		// if (!music?.name) {
		// 	return;
		// }

		// const music2 = await confDb.playlist.update({
		// 	where: {
		// 		playlist_unique: {
		// 			userId: req.user.sub,
		// 			id: req.params.id,
		// 		},
		// 	},
		// 	data: {
		// 		cover: `/playlistCovers/${music.name}.jpg`,
		// 		PlaylistTrack: {
		// 			connectOrCreate: {
		// 				where: {
		// 					playlist_track_unique: {
		// 						trackId: req.body.id,
		// 						playlistId: req.params.id,
		// 					},
		// 				},
		// 				create: {
		// 					trackId: req.body.id,
		// 				},
		// 			},
		// 		},
		// 	},
		// 	include: {
		// 		PlaylistTrack: {
		// 			include: {
		// 				track: {
		// 					include: {
		// 						Artist: true,
		// 						Album: {
		// 							include: {
		// 								Library: {
		// 									include: {
		// 										Folders: {
		// 											include: {
		// 												folder: true,
		// 											},
		// 										},
		// 									},
		// 								},
		// 							},
		// 						},
		// 						FavoriteTrack: {
		// 							where: {
		// 								userId: req.user.sub,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 			orderBy: {
		// 				updated_at: 'asc',
		// 			},
		// 		},
		// 	},
		// });

		// const images:any [] = [];

		// for (let i = 0; i < music2.PlaylistTrack.length; i++) {
		// 	const t = music2.PlaylistTrack[i];

		// 	if (!t.track.cover) { continue; }
		// 	let image: any;
		// 	let hash: any;

		// 	try {
		// 		image = `${imagesPath}/${t.track.Album[0].id}.jpg`;
		// 		hash = await createImageHash(image);
		// 	} catch (error) {
		// 		image = `${t.track.Album[0].Library.Folders[0].folder?.path}/${t.track.folder}/${t.track.cover}`;
		// 		hash = await createImageHash(image);
		// 	}

		// 	images.push({
		// 		hash,
		// 		image,
		// 		outputFile: convertPath(`${imagesPath}/playlistCovers/${music2.name}.jpg`),
		// 	});

		// }

		// const imageList = unique(images.sort((b, a) => a.image - b.image), 'hash');

		// if (!fs.existsSync(`${tempPath}/${music2.name}`)) {
		// 	fs.mkdirSync(`${tempPath}/${music2.name}`, { recursive: true });
		// }

		// for (let i = 0; i < imageList.length; i++) {
		// 	const t = imageList[i];

		// 	fs.copyFileSync(t.image, `${tempPath}/${music2.name}/thumb-${i}.jpg`);

		// }

		// if (!fs.existsSync(`${imagesPath}/playlistCovers`)) {
		// 	fs.mkdirSync(`${imagesPath}/playlistCovers`, { recursive: true });
		// }

		// const montageCommand = `"${ffmpeg}" -i "${tempPath}/${music2.name}/thumb-%d.jpg" -frames:v 1 -filter_complex tile='2x2' -y "${imageList[0].outputFile}"`;

		// exec(montageCommand, async (error) => {
		// 	if (error) {
		// 		console.error(`exec error: ${error}`);
		// 		return;
		// 	}

		// 	fs.existsSync(`${tempPath}/${music2.name}`)
		// 		&& fs.rmSync(`${tempPath}/${music2.name}`, { recursive: true });

		// 	const palette = await colorPaletteFromFile(`${imageList[0].outputFile}`);

		// 	await confDb.playlist.update({
		// 		where: {
		// 			playlist_unique: {
		// 				userId: req.user.sub,
		// 				id: req.params.id,
		// 			},
		// 		},
		// 		data: {
		// 			colorPalette: palette
		// 				? jsonToString(palette)
		// 				: null,
		// 		},
		// 	});

		// });


		// return res.json(music);
	} catch (error) {
		console.log(error);
	}
}

// const createImageHash = (image) => {
// 	return new Promise((resolve, reject) => {
// 		imageHash(image, 25, true, (error, data) => {
// 			if (error) { reject(error); }

// 			resolve(data);
// 		});
// 	});
// };
