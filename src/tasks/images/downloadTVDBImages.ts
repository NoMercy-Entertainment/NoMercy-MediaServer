import downloadImage from '../../functions/downloadImage/downloadImage';
import path from 'path';
import { imagesPath } from '../../state';
import getTVDBImages, { ImageResult } from './getTVDBImages';
import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import { commitConfigTransaction } from '../../database';
import { Stats } from 'fs';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { CompleteTvAggregate } from '../../tasks/data/fetchTvShow';
import { CompleteMovieAggregate } from '../../tasks/data/fetchMovie';
import { PaletteColors } from 'types/server';

export const downloadTVDBImages = async (dbType: string, req: CompleteTvAggregate | CompleteMovieAggregate) => {
	return new Promise<void>(async (resolve, reject) => {
		try {
			const transaction: Prisma.PromiseReturnType<any>[] = [];

			let type = dbType == 'tv' ? 'series' : 'movies';
			const data = await getTVDBImages(
				type,
				(req as CompleteMovieAggregate).title ?? (req as CompleteTvAggregate).name,
				(req as CompleteTvAggregate).first_air_date ?? (req as CompleteMovieAggregate).release_date
			);

			for (let i = 0; i < data.length; i++) {
				const image = data[i];

				// if (existsSync(`${imagesPath}/${image.credit_id}.jpg`)) continue;

				await downloadImage(image.img, path.resolve(`${imagesPath}/${image.credit_id}.jpg`))
					.then(({ dimensions, stats, colorPalette }) => {
						// console.log({dbType, image, dimensions, stats, req})
						transaction.push(
							confDb.image.upsert({
								where: {
									id: image.credit_id,
								},
								create: imageQuery(dbType, image, dimensions, stats, colorPalette, req),
								update: imageQuery(dbType, image, dimensions, stats, colorPalette, req),
							})
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
		aspectRatio: dimensions.width! / dimensions.height! ?? 0.6666666666666667,
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
