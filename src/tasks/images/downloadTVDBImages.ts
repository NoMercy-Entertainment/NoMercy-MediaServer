import { Stats, existsSync } from 'fs';
import getTVDBImages, { ImageResult } from './getTVDBImages';

import { CompleteMovieAggregate } from '../../tasks/data/fetchMovie';
import { CompleteTvAggregate } from '../../tasks/data/fetchTvShow';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { PaletteColors } from 'types/server';
import { Prisma } from '@prisma/client'
import { commitConfigTransaction } from '../../database';
import { confDb } from '../../database/config';
import downloadImage from '../../functions/downloadImage/downloadImage';
import { imagesPath } from '../../state';
import path from 'path';

export const downloadTVDBImages = async (dbType: string, req: CompleteTvAggregate | CompleteMovieAggregate) => {
	return new Promise<void>(async (resolve, reject) => {
		try {
			const transaction: Prisma.PromiseReturnType<any>[] = [];

			let type = dbType == 'tv' ? 'series' : 'movies';
			const data = await getTVDBImages(
				type,req
			);

			for (let i = 0; i < data.length; i++) {
				const image = data[i];

				if (existsSync(`${imagesPath}/cast/${image.credit_id}.jpg`)) continue;

				await downloadImage(image.img, path.resolve(`${imagesPath}/cast/${image.credit_id}.jpg`))
					.then(async ({ dimensions, stats, colorPalette }) => {
						transaction.push(
							confDb.image.upsert({
								where: {
									id: image.credit_id,
								},
								create: imageQuery(dbType, image, dimensions, stats, colorPalette, req),
								update: imageQuery(dbType, image, dimensions, stats, colorPalette, req),
							}).catch(error => console.log(error))
						);
					})
					.catch(() => null);
			}

			await commitConfigTransaction(transaction);

			resolve();
		} catch (error) {
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
	req: CompleteTvAggregate | CompleteMovieAggregate
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
		colorPalette: colorPalette ? JSON.stringify(colorPalette) : null,
		name: `${image.credit_id}.jpg`,
		tvId: dbType == 'tv' ? req.id : undefined,
		movieId: dbType == 'movie' ? req.id : undefined,
	});
