import { AppState, useSelector } from '@/state/redux';
import { Image, Prisma } from '../../database/config/client';
import { Stats, existsSync } from 'fs';
import getTVDBImages, { ImageResult } from './getTVDBImages';

import { CompleteMovieAggregate } from '../../tasks/data/fetchMovie';
import { CompleteTvAggregate } from '../../tasks/data/fetchTvShow';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import Logger from '../../functions/logger';
import { PaletteColors } from 'types/server';
import downloadImage from '../../functions/downloadImage/downloadImage';
import { imagesPath } from '@/state';
import path from 'path';

interface DownloadTVDBImages {
	type: string;
	data: (CompleteMovieAggregate | CompleteTvAggregate) & { task?: { id: string } };
}

export const execute = ({ type, data }: DownloadTVDBImages) => {

	return new Promise<void>(async (resolve, reject) => {

		try {
			Logger.log({
				level: 'info',
				name: 'App',
				color: 'magentaBright',
				message: 'Fetching character images',
			});

			const newType = type == 'tv'
				? 'series'
				: 'movies';
			const imageData = await getTVDBImages(
				newType,
				data
			);

			const transaction: Array<Prisma.Prisma__ImageClient<Image, never>> = [];

			for (let i = 0; i < imageData.length; i++) {
				const image = imageData[i];
				const file = `${imagesPath}/cast/${image.profile_path?.replace('.jpg', '.webp')}`;

				// if (!data.people.some(p => p.id == image.id)) {
				// 	continue;
				// }

				// const query = await confDb.image.findFirst({
				// 	where: {
				// 		id: image.credit_id,
				// 	},
				// });

				if (existsSync(`${imagesPath}/cast/${image.credit_id}.webp`)) continue;

				await downloadImage({
					url: image.img,
					path: path.resolve(`${imagesPath}/cast/${image.credit_id}.webp`),
				})
					// eslint-disable-next-line no-loop-func
					.then(async ({ dimensions, stats, colorPalette, blurHash }) => {
						// const query = imageQuery(newType, image, dimensions, stats, colorPalette, data, blurHash);

						// transaction.push(
						// await	confDb.image.upsert({
						// 	where: {
						// 		id: image.credit_id,
						// 	},
						// 	create: query,
						// 	update: query,
						// });
						// );
					})
					.catch(() => null);
			}

			// while (await checkDbLock()) {
			// 	//
			// }
			// await confDb.$transaction(transaction).catch(e => console.log(e));


			Logger.log({
				level: 'verbose',
				name: 'App',
				color: 'magentaBright',
				message: 'Fetching images complete',
			});

			resolve();
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

const imageQuery = (
	dbType: string,
	image: ImageResult,
	dimensions: ISizeCalculationResult,
	stats: Stats,
	colorPalette: PaletteColors | null,
	req: CompleteTvAggregate | CompleteMovieAggregate,
	blurHash: string | null
) =>
	Prisma.validator<Prisma.ImageUncheckedUpdateInput>()({
		id: image.credit_id,
		filePath: `/${image.credit_id}.jpg`,
		aspectRatio: dimensions.width && dimensions.height
			? (dimensions.width / dimensions.height)
			: 0.6666666666666666,
		site: 'thetvdb.com',
		iso6391: 'xx',
		height: dimensions.height,
		width: dimensions.width,
		type: dimensions.type,
		size: stats.size,
		name: `${image.credit_id}.jpg`,
		colorPalette: colorPalette
			? JSON.stringify(colorPalette)
			: null,
		blurHash: blurHash,
		Cast: {
			connect: dbType == 'series'
				? {
					personId_tvId: {
						personId: image.id,
						tvId: req.id,
					},
				}
				: dbType == 'movies'
					? {
						personId_movieId: {
							personId: image.id,
							movieId: req.id,
						},
					}
					: {
					},
		},
	});

export const downloadTVDBImages = async ({ type, data }: DownloadTVDBImages) => {
	const queue = useSelector((state: AppState) => state.config.dataWorker);

	await queue.add({
		file: __filename,
		fn: 'execute',
		args: { type, data },
	});
};

export default downloadTVDBImages;
