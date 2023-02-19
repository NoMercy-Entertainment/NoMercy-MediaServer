import { existsSync, mkdirSync, Stats } from 'fs';
import {
	ISizeCalculationResult
} from 'image-size/dist/types/interface';
import { PaletteColors } from 'types/server';

import downloadImage from '../../functions/downloadImage/downloadImage';
import { confDb } from '../../database/config';
import { Prisma } from '../../database/config/client';
import {
	EpisodeAppend,
	EpisodeImages
} from '../../providers/tmdb/episode/index';
import {
	MovieAppend,
	MovieCredits,
	MovieImages
} from '../../providers/tmdb/movie/index';
import {
	PersonAppend,
	PersonImages
} from '../../providers/tmdb/people/index';
import {
	SeasonAppend,
	SeasonImages
} from '../../providers/tmdb/season/index';
import {
	Cast,
	Crew,
	Image
} from '../../providers/tmdb/shared/index';
import {
	TvAppend,
	TvCredits,
	TvImages
} from '../../providers/tmdb/tv/index';
import { imagesPath } from '../../state';
import {
	CompleteMovieAggregate
} from '../../tasks/data/fetchMovie';
import {
	CompleteTvAggregate
} from '../../tasks/data/fetchTvShow';

interface DownloadTMDBImages {
	type: string;
	data: (TvAppend | MovieAppend | SeasonAppend |
		EpisodeAppend | PersonAppend | CompleteMovieAggregate | CompleteTvAggregate) & {task?: {id: string}};
}

export const downloadTMDBImages = ({ type, data }: DownloadTMDBImages) => {
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

					const usableImageSizes = imageSizes.filter(i => i.type.includes(allowedType));

					usableImageSizes.forEach((s) => {
						mkdirSync(`${imagesPath}/${s.size}`, { recursive: true });
					});

					for (let k = 0; k < 1; k++) {
						const size = usableImageSizes[k]?.size;

						if (!size) continue;

						const file = (image as Image).file_path ?? (image as Cast|Crew).profile_path;
						if (!file) continue;

						const newFile = file?.replace(/.jpg$|.png$/u, '.webp');

						const query = await confDb.image.findFirst({
							where: {
								filePath: file,
							},
						});

						if (existsSync(`${imagesPath}/${size}${newFile}`) && query?.id) {
							continue;
						}

						// promises.push(
						await	downloadImage(`https://image.tmdb.org/t/p/${size}${file}`, `${imagesPath}/${size}${newFile}`, usableImageSizes)
							.then(async ({ dimensions, stats, colorPalette, blurHash }) => {
								// transaction.push(
								await	confDb.image.upsert({
									where: {
										filePath: file,
									},
									create: imageQuery(type, data, image, dimensions, stats, colorPalette, blurHash),
									update: imageQuery(type, data, image, dimensions, stats, colorPalette, blurHash),
								});
								// );
							})
							.catch(e => console.log(e));
						// );
					}
				}
			}

			resolve();

		} catch (error) {
			// console.log(error);
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
	blurHash: string | null
) => {

	const path = (image as Image).file_path ?? (image as Cast|Crew).profile_path;

	return Prisma.validator<Prisma.ImageUncheckedUpdateInput>()({
		id: path.match(/\w+/u)![0],
		aspectRatio: (image as Image).aspect_ratio ?? (dimensions.width && dimensions.height
			? dimensions.width / dimensions.height
			: undefined),
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
		tvId: dbType == 'tv'
			? data.id
			: undefined,
		movieId: dbType == 'movie'
			? data.id
			: undefined,
		colorPalette: colorPalette
			? JSON.stringify(colorPalette)
			: null,
		blurHash: blurHash,
	});
};
