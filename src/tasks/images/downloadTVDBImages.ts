import { Stats, existsSync } from 'fs';
import getTVDBImages, {
	ImageResult,
} from './getTVDBImages';

import {
	CompleteMovieAggregate,
} from '../../tasks/data/fetchMovie';
import {
	CompleteTvAggregate,
} from '../../tasks/data/fetchTvShow';
import {
	ISizeCalculationResult,
} from 'image-size/dist/types/interface';
import Logger from '../../functions/logger';
import { PaletteColors } from 'types/server';
import { Prisma } from '@prisma/client';
import { confDb } from '../../database/config';
import downloadImage from '../../functions/downloadImage/downloadImage';
import { imagesPath } from '../../state';
import path from 'path';

interface DownloadTVDBImages {
	type: string;
	data: (CompleteMovieAggregate | CompleteTvAggregate) & {task?: {id: string}};
}

export const downloadTVDBImages = async ({ type, data }: DownloadTVDBImages) => {
	
	return new Promise<void>(async (resolve, reject) => {
		
		try {
			const transaction: Prisma.PromiseReturnType<any>[] = [];
			const promises: any[] = [];

			Logger.log({
				level: 'info',
				name: 'App',
				color: 'magentaBright',
				message: `Fetching character images`,
			});

			type = type == 'tv' ? 'series' : 'movies';
			const imageData = await getTVDBImages(
				type,
				data
			);
			
			for (let i = 0; i < imageData.length; i++) {
				const image = imageData[i];

				const query = await confDb.image.findFirst({
					where: {
						id: image.credit_id,
					}
				});

				if (existsSync(`${imagesPath}/cast/${image.credit_id}.webp`) && query?.id) continue;

				await downloadImage(image.img, path.resolve(`${imagesPath}/cast/${image.credit_id}.webp`))
					.then(async ({ dimensions, stats, colorPalette, blurHash }) => {
						// transaction.push(
						await 	confDb.image.upsert({
								where: {
									id: image.credit_id,
								},
								create: imageQuery(type, image, dimensions, stats, colorPalette, data, blurHash),
								update: imageQuery(type, image, dimensions, stats, colorPalette, data, blurHash),
							})
						// );
					}).catch(e => console.log(e));
			}

			// const promiseChunks = chunk(promises, 10);
			// for (const promise of promiseChunks) {
			// 	await Promise.all(promise.map(p => p())).catch(e => console.log(e));
			// }
			
			// await commitConfigTransaction(transaction);

			Logger.log({
				level: 'info',
				name: 'App',
				color: 'magentaBright',
				message: `Fetching character images complete`,
			});

			resolve();
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};

export default downloadTVDBImages;

const imageQuery = (
	dbType: string,
	image: ImageResult,
	dimensions: ISizeCalculationResult,
	stats: Stats,
	colorPalette: PaletteColors | null,
	req: CompleteTvAggregate | CompleteMovieAggregate, 
	blurHash: string|null,
) =>
	Prisma.validator<Prisma.ImageUncheckedUpdateInput>()({
		id: image.credit_id,
		filePath: `/${image.credit_id}.jpg`,
		aspectRatio: dimensions.width && dimensions.height ? (dimensions.width / dimensions.height) : 0.6666666666666666,
		site: 'thetvdb.com',
		iso6391: 'xx',
		height: dimensions.height,
		width: dimensions.width,
		type: dimensions.type,
		size: stats.size,
		name: `${image.credit_id}.jpg`,
		colorPalette: colorPalette ? JSON.stringify(colorPalette) : null,
		blurHash: blurHash, 
		tvId: dbType == 'tv' ? req.id : undefined,
		movieId: dbType == 'movie' ? req.id : undefined,
	});
