import { EP } from '@server/tasks/files/filenameParser';
import { FFMpegArchive } from './archiver';

// import { AppState, useSelector } from '@server/state/redux';

export const encodeInput = async ({ id }: {id:number}) => {

	// const queue = useSelector((state: AppState) => state.config.queueWorker);

	// const episodes: EP[] = await confDb.episode.findMany({
	// 	where: {
	// 		tvId: id,
	// 		File: {
	// 			some: {
	// 				extension: '.mkv',
	// 			},
	// 		},
	// 	},
	// 	include: {
	// 		Tv: true,
	// 		Season: true,
	// 		File: {
	// 			include: {
	// 				Library: {
	// 					include: {
	// 						Folders: {
	// 							include: {
	// 								folder: true,
	// 							},
	// 						},
	// 						EncoderProfiles: {
	// 							include: {
	// 								EncoderProfile: true,
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// });

	// for (const episode of episodes) {

	// 	await encodeEpisode({ episode });

	// 	// await queue.add({
	// 	//     file: resolve(__dirname, 'encodeInput'),
	// 	//     fn: 'encodeEpisode',
	// 	//     args: episode,
	// 	// });
	// }

	// return episodes;
};

export const encodeEpisode = async ({ episode }: { episode: EP }) => {

	const onDemand = new FFMpegArchive();

	await onDemand.fromDatabase(episode);

	onDemand
		.verifyHLS();

	await onDemand.makeStack();
	// onDemand.check();
	await onDemand.start(() => onDemand.buildSprite());
};
