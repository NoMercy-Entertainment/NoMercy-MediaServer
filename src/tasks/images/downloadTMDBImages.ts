import { existsSync, mkdirSync, Stats } from 'fs';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { PaletteColors } from 'types/server';

import { checkDbLock } from '@/database';

import { confDb } from '../../database/config';
import { Image as DBimage, Prisma } from '../../database/config/client';
import downloadImage from '../../functions/downloadImage/downloadImage';
import { EpisodeAppend, EpisodeImages } from '../../providers/tmdb/episode/index';
import { MovieAppend, MovieCredits, MovieImages } from '../../providers/tmdb/movie/index';
import { PersonAppend, PersonImages } from '../../providers/tmdb/people/index';
import { SeasonAppend, SeasonImages } from '../../providers/tmdb/season/index';
import { Cast, Crew, Image } from '../../providers/tmdb/shared/index';
import { TvAppend, TvCredits, TvImages } from '../../providers/tmdb/tv/index';
import { imagesPath } from '../../state';
import { AppState, useSelector } from '../../state/redux';
import { CompleteMovieAggregate } from '../../tasks/data/fetchMovie';
import { CompleteTvAggregate } from '../../tasks/data/fetchTvShow';

interface DownloadTMDBImages {
	type: string;
	// eslint-disable-next-line max-len
	data: (TvAppend | MovieAppend | SeasonAppend | EpisodeAppend | PersonAppend | CompleteMovieAggregate | CompleteTvAggregate) & {
		task?: {
			id: string
		}
	};
}

export const execute = ({ type, data }: DownloadTMDBImages) => {
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

			const transaction: Array<Prisma.Prisma__ImageClient<DBimage, never>> = [];

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

						if (query?.blurHash && query?.colorPalette && existsSync(`${imagesPath}/${size}${newFile}`)) {
							continue;
						}

						// promises.push(
						await	downloadImage({
							url: `https://image.tmdb.org/t/p/${size}${file}`,
							path: `${imagesPath}/${size}${newFile}`,
							usableImageSizes,
						})
							.then(({ dimensions, stats, colorPalette, blurHash }) => {
								transaction.push(
									confDb.image.upsert({
										where: {
											id: query?.id,
										},
										create: imageQuery(type, data, image, dimensions, stats, colorPalette, blurHash),
										update: imageQuery(type, data, image, dimensions, stats, colorPalette, blurHash),
									})
								);
							})
							.catch(e => console.log(e));
						// );
					}
				}
			}

			while (await checkDbLock()) {
				//
			}
			await confDb.$transaction(transaction).catch(e => console.log(e));

			resolve();

		} catch (error) {
			// console.log(error);
			reject(error);
		}

	});
};

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

export const downloadTMDBImages = async ({ type, data }: DownloadTMDBImages) => {
	const queue = useSelector((state: AppState) => state.config.dataWorker);

	await queue.add({
		file: __filename,
		fn: 'execute',
		args: { type, data },
	});
};

export default downloadTMDBImages;

