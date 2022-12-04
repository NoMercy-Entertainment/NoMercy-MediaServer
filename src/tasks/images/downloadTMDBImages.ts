import { existsSync, Stats } from 'fs';
import {
  ISizeCalculationResult,
} from 'image-size/dist/types/interface';
import { PaletteColors } from 'types/server';
import { Prisma } from '@prisma/client';

import downloadImage, {
  DownloadImage,
} from '../../functions/downloadImage/downloadImage';
import {
  Cast,
  Crew,
  Image,
} from '../../providers/tmdb/shared/index';
import {
  EpisodeAppend,
  EpisodeImages,
} from '../../providers/tmdb/episode/index';
import {
  MovieAppend,
  MovieCredits,
  MovieImages,
} from '../../providers/tmdb/movie/index';
import {
  PersonAppend,
  PersonImages,
} from '../../providers/tmdb/people/index';
import {
  SeasonAppend,
  SeasonImages,
} from '../../providers/tmdb/season/index';
import {
  TvAppend,
  TvCredits,
  TvImages,
} from '../../providers/tmdb/tv/index';
import {
  CompleteMovieAggregate,
} from '../../tasks/data/fetchMovie';
import {
  CompleteTvAggregate,
} from '../../tasks/data/fetchTvShow';
import { chunk } from '../../functions/stringArray';
import { commitConfigTransaction } from '../../database';
import { confDb } from '../../database/config';
import { imagesPath } from '../../state';

interface DownloadTMDBImages {
	type: string;
	data: (TvAppend | MovieAppend | SeasonAppend | EpisodeAppend | PersonAppend | CompleteMovieAggregate | CompleteTvAggregate) & {task?: {id: string}};
}

export const downloadTMDBImages = async ({type, data}: DownloadTMDBImages) => {
	const imageSizes = [
		{
			size: 'original',
			type: [
				'posters',
				'backdrops',
				'logos',
				'stills',
				'profiles',
				'cast',
				'crew',
			],
		},
		{
			size: 'w500',
			type: [
				'posters',
				'backdrops',
				'logos',
				'stills',
				'profiles',
				'cast',
				'crew',
			],
		},
		{
			size: 'w300',
			type: [
				'posters',
				'backdrops',
				'logos',
				'stills',
				'profiles',
				'cast',
				'crew',
			],
		},
		{
			size: 'w185',
			type: [
				'posters',
				'backdrops',
				'logos',
				'stills',
				'profiles',
				'cast',
				'crew',
			],
		},
	];

	return new Promise<void>(async (resolve, reject) => {
		const transaction: Prisma.PromiseReturnType<any>[] = [];
		const promises: Array<Promise<void | DownloadImage>> 
			= new Array<Promise<void | DownloadImage>>;

		try {
			const combinedList: { [arg: string]: Array<Image|Cast|Crew> } = {
				posters: (data.images as TvImages | MovieImages | SeasonImages)?.posters ?? [],
				backdrops: (data.images as TvImages | MovieImages | SeasonImages)?.backdrops ?? [],
				stills: (data.images as EpisodeImages)?.stills ?? [],
				logos: (data.images as TvImages | MovieImages)?.logos ?? [],
				profiles: (data.images as PersonImages)?.profiles ?? [],
				casts: (data.credits as TvCredits | MovieCredits)?.cast ?? [],
				crew: (data.credits as TvCredits | MovieCredits)?.crew ?? [],
			};
	
			for (let i = 0; i < Object.values<Array<Image|Cast|Crew>>(combinedList).length; i++) {
				const images = Object.values<Array<Image|Cast|Crew>>(combinedList)[i];
				const allowedType = Object.keys(combinedList)[i];
	
				for (let j = 0; j < images.length; j++) {
					const image = images[j];
	
					const usableImageSizes = imageSizes.filter((i) => i.type.includes(allowedType));
	
					for (let k = 0; k < usableImageSizes.length; k++) {
						const size = usableImageSizes[k].size;
	
						const file = (image as Image).file_path ?? (image as Cast|Crew).profile_path;
						const newFile = file?.replace(/.jpg$|.png$/u, '.webp');
						
						if (!newFile || existsSync(`${imagesPath}/${size}${newFile}`)) continue;
						
						// promises.push( 
						await	downloadImage(`https://image.tmdb.org/t/p/${size}${file}`, `${imagesPath}/${size}${newFile}`)
								.then(async ({ dimensions, stats, colorPalette }) => {
									transaction.push(
										confDb.image.upsert({
											where: {
												filePath: file,
											},
											create: imageQuery(type, data, image, dimensions, stats, colorPalette),
											update: imageQuery(type, data, image, dimensions, stats, colorPalette),
										})
									);
								}).catch(e => console.log(e))
						// );
						
						// console.log(`${imagesPath}/${size}${newFile}`);
					}
				}
			}
	
			// console.log(promises);
	
			// const promiseChunks = chunk(promises, 10);
			// for (const promise of promiseChunks) {
			// 	await Promise.all(promise);
			// }
	
			await commitConfigTransaction(transaction);
	
			resolve();
			
		} catch (error) {
			
			console.log(error);
			reject(error);
		}
	
	});
};

export default downloadTMDBImages;

const imageQuery = (
	dbType: string,
	data: TvAppend | MovieAppend | SeasonAppend | EpisodeAppend | PersonAppend | CompleteMovieAggregate | CompleteTvAggregate,
	image: Image|Cast|Crew,
	dimensions: ISizeCalculationResult,
	stats: Stats,
	colorPalette: PaletteColors | null,
) => {

	const path = (image as Image).file_path ?? (image as Cast|Crew).profile_path;

	return Prisma.validator<Prisma.ImageUncheckedUpdateInput>()({
		id: path.match(/\w+/)![0],
		aspectRatio: (image as Image).aspect_ratio ?? (dimensions.width && dimensions.height ? dimensions.width / dimensions.height : undefined),
		height: (image as Image).height ?? dimensions.height,
		iso6391: (image as Image).iso_639_1 ?? undefined,
		filePath: path,
		width: (image as Image).width ?? dimensions.width,
		site: 'themoviedb.org',
		type: dimensions.type,
		size: stats.size,
		name: path,
		voteAverage: (image as Image).vote_average ?? undefined,
		voteCount: (image as Image).vote_count ?? undefined,
		tvId: dbType == 'tv' ? data.id : undefined,
		movieId: dbType == 'movie' ? data.id : undefined,
		colorPalette: colorPalette ? JSON.stringify(colorPalette) : null,
	});
};
