import { EpisodeAppend, EpisodeImages } from '../../providers/tmdb/episode/index';
import { MovieAppend, MovieImages } from '../../providers/tmdb/movie/index';
import { PersonAppend, PersonImages } from '../../providers/tmdb/people/index';
import { SeasonAppend, SeasonImages } from '../../providers/tmdb/season/index';
import { Stats, existsSync } from 'fs';
import { TvAppend, TvImages } from '../../providers/tmdb/tv/index';

import { CompleteMovieAggregate } from '../../tasks/data/fetchMovie';
import { CompleteTvAggregate } from '../../tasks/data/fetchTvShow';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { Image } from '../../providers/tmdb/shared/index';
import { Prisma } from '@prisma/client'
import { chunk } from '../../functions/stringArray';
import { commitConfigTransaction } from '../../database';
import { confDb } from '../../database/config';
import downloadImage from '../../functions/downloadImage/downloadImage';
import { imagesPath } from '../../state';

export const downloadTMDBImages = async (dbType: string, data: TvAppend | MovieAppend | SeasonAppend | EpisodeAppend | PersonAppend | CompleteMovieAggregate | CompleteTvAggregate) => {
	const imageSizes = [
		{
			type: [
				// 'posters',
				// 'backdrops',
				'logos',
				// 'stills',
				// 'profiles',
			],
			size: 'original',
		},
		{
			type: ['posters', 'logos', 'stills', 'profiles'],
			size: 'w300',
		},
		{
			type: ['posters', 'stills', 'profiles'],
			size: 'w185',
		},
	];

	return new Promise<void>(async (resolve, reject) => {
		try {

			const transaction: Prisma.PromiseReturnType<any>[] = [];
			const promises: any[] = [];

			const combinedList: { [arg: string]: Image[] } = {
				posters: (data.images as TvImages | MovieImages | SeasonImages)?.posters ?? [],
				backdrops: (data.images as TvImages | MovieImages | SeasonImages)?.backdrops ?? [],
				stills: (data.images as EpisodeImages)?.stills ?? [],
				logos: (data.images as TvImages | MovieImages)?.logos ?? [],
				profiles: (data.images as PersonImages)?.profiles ?? [],
			};

			for (let i = 0; i < Object.values<Image[]>(combinedList).length; i++) {
				const images = Object.values<Image[]>(combinedList)[i];
				const type = Object.keys(combinedList)[i];

				for (let j = 0; j < images.length; j++) {
					const image = images[j];

					const usableImageSizes = imageSizes.filter((i) => i.type.includes(type));

					for (let k = 0; k < usableImageSizes.length; k++) {
						const size = usableImageSizes[k].size;

						if (existsSync(`${imagesPath}/${size}${image.file_path}`)) continue;
						
						promises.push(() => downloadImage(`https://image.tmdb.org/t/p/${size}${image.file_path}`, `${imagesPath}/${size}${image.file_path}`)
							.then(async ({ dimensions, stats, colorPalette }) => {
								transaction.push(
									confDb.image.upsert({
										where: {
											filePath: image.file_path,
										},
										create: imageQuery(dbType, data, image, dimensions, stats),
										update: imageQuery(dbType, data, image, dimensions, stats),
									}).catch(error => console.log(error))
								);
							}));
					}
				}
			}

			const promiseChunks = chunk(promises, 10);
			for (const promise of promiseChunks) {
				await Promise.all(promise.map(p => p()));
			}

			await commitConfigTransaction(transaction);

			resolve();
		} catch (error) {
			reject(error);
		}
	});
};

export default downloadTMDBImages;

const imageQuery = (
	dbType: string,
	data: TvAppend | MovieAppend | SeasonAppend | EpisodeAppend | PersonAppend | CompleteMovieAggregate | CompleteTvAggregate,
	image: Image,
	dimensions: ISizeCalculationResult,
	stats: Stats
) =>
	Prisma.validator<Prisma.ImageUncheckedUpdateInput>()({
		id: image.file_path.match(/\w+/)![0],
		aspectRatio: image.aspect_ratio,
		height: image.height,
		iso6391: image.iso_639_1,
		filePath: image.file_path,
		width: image.width,
		site: 'themoviedb.org',
		type: dimensions.type,
		size: stats.size,
		name: image.file_path,
		voteAverage: image.vote_average,
		voteCount: image.vote_count,
		tvId: dbType == 'tv' ? data.id : undefined,
		movieId: dbType == 'movie' ? data.id : undefined,
	});
