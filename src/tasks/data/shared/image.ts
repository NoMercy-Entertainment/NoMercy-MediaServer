import { AppState, useSelector } from '@server/state/redux';
import { existsSync, mkdirSync } from 'fs';

import { CompleteMovieAggregate } from '../movie/fetchMovie';
import { CompleteTvAggregate } from '../tv/fetchTvShow';
import { EpisodeAppend } from '@server/providers/tmdb/episode/index';
import { Image } from '@server/providers/tmdb/shared/index';
import { MovieAppend } from '@server/providers/tmdb/movie/index';
import { PersonAppend } from '@server/providers/tmdb/people/index';
import { SeasonAppend } from '@server/providers/tmdb/season/index';
import downloadImage from '@server/functions/downloadImage';
import { imagesPath } from '@server/state';
import { eq } from 'drizzle-orm';
import { tvs } from '@server/db/media/schema/tvs';
import { seasons } from '@server/db/media/schema/seasons';
import { episodes } from '@server/db/media/schema/episodes';
import { people } from '@server/db/media/schema/people';
import { medias } from '@server/db/media/schema/medias';
import { guestStars } from '@server/db/media/schema/guestStars';
import { movies } from '@server/db/media/schema/movies';
import { images } from '@server/db/media/schema/images';
import Logger from '@server/functions/logger';
import { sleep } from '@server/functions/dateTime';
import { insertImage } from '@server/db/media/actions/images';

export const image = (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | MovieAppend | PersonAppend | CompleteMovieAggregate,
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar'
) => {

	if (!req.images[`${type}s`]) return;

	for (const image of req.images[`${type}s`] as Array<Image>) {

		try {
			const query = insertImage({
				aspectRatio: image.aspect_ratio,
				height: image.height,
				iso6391: image.iso_639_1 ?? undefined,
				filePath: (image[`${type}_path`] as string) ?? (image.file_path as string),
				type: type,
				voteAverage: image.vote_average,
				voteCount: image.vote_count,
				width: image.width,
				[`${table}_id`]: req.id,
			});

			if (!query?.colorPalette) {
				downloadAndHash({
					src: (image[`${type}_path`] as string) ?? (image.file_path as string),
					table: 'image',
					column: 'filePath',
					type: type,
					only: ['colorPalette', 'blurHash'],
				});
			}

		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['images', type, error]),
			});
		}
	}
};

export const downloadAndHash = ({
	src,
	table,
	column,
	type,
	only,
}: {
	src: string,
	column: string,
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar' | 'image';
	only?: Array<'colorPalette' | 'blurHash'>;
}) => {

	const queue = useSelector((state: AppState) => state.config.dataWorker);

	queue.add({
		file: __filename,
		fn: 'execute',
		args: {
			src,
			table,
			column,
			type,
			only,
		},
	});
};

export const execute = async ({
	src,
	table,
	column,
	type,
	only,
}: {
	src: string,
	column: string,
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar' | 'image';
	only?: Array<'colorPalette' | 'blurHash'>;
}) => {

	const models = {
		movie: movies,
		tv: tvs,
		season: seasons,
		episode: episodes,
		person: people,
		media: medias,
		image: images,
		guestStar: guestStars,
	};

	const imageSizes = [
		{
			size: 'original',
			type: [
				'poster',
				'backdrop',
				'logo',
				'still',
				'profile',
				'cast',
				'crew',
			],
		},
		{
			size: 'w500',
			type: [
				'poster',
				'backdrop',
				'logo',
				'still',
				'profile',
				'cast',
				'crew',
			],
		},
		{
			size: 'w300',
			type: [
				'poster',
				'backdrop',
				'logo',
				'still',
				'profile',
				'cast',
				'crew',
			],
		},
		{
			size: 'w185',
			type: [
				'poster',
				'backdrop',
				'logo',
				'still',
				'profile',
				'cast',
				'crew',
			],
		},
	];

	const usableImageSizes = imageSizes.filter(i => i.type.includes(type));

	usableImageSizes.forEach((s) => {
		mkdirSync(`${imagesPath}/${s.size}`, { recursive: true });
	});

	if (!src) return;

	const newFile = src?.replace(/.jpg$|.png$/u, '.webp');

	const query = globalThis.mediaDb.select()
		.from(models[table])
		.where(eq(models[table][column], src))
		.get();

	const newFilePath = `${imagesPath}/${imageSizes[0].size}${newFile}`;

	if (query?.colorPalette && existsSync(newFilePath)) {
		return;
	}

	const imageUrl = `https://image.tmdb.org/t/p/${imageSizes[0].size}${src}`;

	await downloadImage({
		url: imageUrl,
		path: newFilePath,
		usableImageSizes: usableImageSizes,
		only: only,
	})
		.then(({
			colorPalette,
			blurHash,
		}) => {
			insert({
				colorPalette,
				blurHash,
				models,
				table,
				column,
				only,
				src,
			});
		})
		.catch(e => console.log(table, e));
};

const insert = ({
	colorPalette,
	blurHash,
	models,
	table,
	column,
	only,
	src,
}) => {
	try {
		globalThis.mediaDb.update(models[table])
			.set({
				color_palette: colorPalette && (!only || only.includes('colorPalette'))
					?					JSON.stringify(colorPalette)
					:					undefined,
				blurHash: blurHash && (!only || only.includes('blurHash'))
					?					blurHash
					:					undefined,
			})
			.where(eq(models[table][column], src))
			.run();
	} catch (e) {
		sleep(1000);
		insert({
			colorPalette,
			blurHash,
			models,
			table,
			column,
			only,
			src,
		});
	}
};
