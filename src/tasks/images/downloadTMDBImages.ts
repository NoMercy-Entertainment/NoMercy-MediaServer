import { AppState, useSelector } from '@server/state/redux';
import { Cast, Crew, Image } from '@server/providers/tmdb/shared/index';
import { EpisodeAppend, EpisodeImages } from '@server/providers/tmdb/episode/index';
import { MovieAppend, MovieCredits, MovieImages } from '@server/providers/tmdb/movie/index';
import { PersonAppend, PersonImages } from '@server/providers/tmdb/people/index';
import { SeasonAppend, SeasonImages } from '@server/providers/tmdb/season/index';
import { mkdirSync } from 'fs';
import { TvAppend, TvCredits, TvImages } from '@server/providers/tmdb/tv/index';

import { CompleteMovieAggregate } from '../data/movie/fetchMovie';
import { CompleteTvAggregate } from '../data/tv/fetchTvShow';
import downloadImage from '@server/functions/downloadImage/downloadImage';
import { imagesPath } from '@server/state';
import { insertImage } from '@server/db/media/actions/images';

interface DownloadTMDBImages {
	type: 'tv' | 'movie' | 'season' | 'episode' | 'person';
	// eslint-disable-next-line max-len
	data: (TvAppend | MovieAppend | SeasonAppend | EpisodeAppend | PersonAppend | CompleteMovieAggregate | CompleteTvAggregate) & {
		task?: {
			id: string
		}
	};
}

export const execute = ({ data }: DownloadTMDBImages) => {
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
			const combinedList: { [arg: string]: Array<Image | Cast | Crew> } = {
				posters: (data.images as TvImages | MovieImages | SeasonImages)?.posters ?? [],
				backdrops: (data.images as TvImages | MovieImages | SeasonImages)?.backdrops ?? [],
				stills: (data.images as EpisodeImages)?.stills ?? [],
				logos: (data.images as TvImages | MovieImages)?.logos ?? [],
				profiles: (data.images as PersonImages)?.profiles ?? [],
				casts: (data.credits as TvCredits | MovieCredits)?.cast ?? [],
				crew: (data.credits as TvCredits | MovieCredits)?.crew ?? [],
			};

			for (let i = 0; i < Object.values<Array<Image | Cast | Crew>>(combinedList).length; i++) {
				const imgs = Object.values<Array<Image | Cast | Crew>>(combinedList)[i];
				const allowedType = Object.keys(combinedList)[i];

				for (let j = 0; j < imgs.length; j++) {
					const image = imgs[j];

					const usableImageSizes = imageSizes.filter(i => i.type.includes(allowedType));

					usableImageSizes.forEach((s) => {
						mkdirSync(`${imagesPath}/${s.size}`, { recursive: true });
					});

					for (let k = 0; k < 1; k++) {
						const size = usableImageSizes[k]?.size;

						if (!size) continue;

						const file = (image as Image).file_path ?? (image as Cast | Crew).profile_path;
						if (!file) continue;

						const newFile = file?.replace(/.jpg$|.png$/u, '.webp');

						// const query = globalThis.mediaDb.query.images.findFirst({
						// 	where: eq(images.filePath, file),
						// });

						// if (!file || (query?.blurHash && query?.colorPalette && existsSync(`${imagesPath}/${size}${newFile}`))) {
						// 	continue;
						// }

						await downloadImage({
							url: `https://image.tmdb.org/t/p/${size}${file}`,
							path: `${imagesPath}/${size}${newFile}`,
							usableImageSizes,
						})
							.then(({
								dimensions,
								stats,
								colorPalette,
								blurHash,
							}) => {
								const path = (image as Image).file_path ?? (image as Cast | Crew).profile_path;
								insertImage({
									// id: path.match(/\w+/u)![0],
									aspectRatio: (image as Image).aspect_ratio ?? (dimensions.width && dimensions.height
										?										dimensions.width / dimensions.height
										:										undefined),
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
									color_palette: colorPalette
										?										JSON.stringify(colorPalette)
										:										null,
									blurHash: blurHash,
								});
							})
							.catch(console.log);
					}
				}
			}

			resolve();

		} catch (error) {
			reject(error);
		}

	});
};

export const downloadTMDBImages = ({
	type,
	data,
}: DownloadTMDBImages) => {
	const queue = useSelector((state: AppState) => state.config.dataWorker);

	queue.add({
		file: __filename,
		fn: 'execute',
		args: {
			type,
			data,
		},
	});
};

export default downloadTMDBImages;

