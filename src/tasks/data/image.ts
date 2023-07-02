import { AppState, useSelector } from '@/state/redux';
import { Media, Prisma } from '../../database/config/client';
import { existsSync, mkdirSync } from 'fs';

import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { Image } from '../../providers/tmdb/shared/index';
import { MovieAppend } from '../../providers/tmdb/movie/index';
import { PersonAppend } from '../../providers/tmdb/people/index';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import downloadImage from '../../functions/downloadImage';
import { imagesPath } from '@/state';
import { mediaDb } from '@/db/media';
import { eq } from 'drizzle-orm';
import { tvs } from '@/db/media/schema/tvs';
import { seasons } from '@/db/media/schema/seasons';
import { episodes } from '@/db/media/schema/episodes';
import { people } from '@/db/media/schema/people';
import { medias } from '@/db/media/schema/medias';
import { guestStars } from '@/db/media/schema/guestStars';
import { insertImage } from '@/db/media/actions/images';
import { movies } from '@/db/media/schema/movies';
import Logger from '@/functions/logger/logger';

export const image = (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | MovieAppend | PersonAppend | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar'
) => {
	if (!req.images[`${type}s`]) return;

	const lang = useSelector((state: AppState) => state.config.language);

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

			if (!query || (['en', lang, null].includes(image.iso_639_1) && !query?.blurHash && !query?.colorPalette)) {
				downloadAndHash({
					src: image.file_path,
					table: 'media',
					column: 'src',
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

export const downloadAndHash = ({ src, table, column, type, transaction, only }: {
	src: string,
	column: string,
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar';
	transaction?: Array<Prisma.Prisma__MediaClient<Media, never>>,
	only?: Array<'colorPalette' | 'blurHash'>;
}) => {

	const queue = useSelector((state: AppState) => state.config.dataWorker);

	queue.add({
		file: __filename,
		fn: 'execute',
		args: { src, table, column, type, transaction, only },
	});
};

export const execute = async ({ src, table, column, type, transaction, only }: {
	src: string,
	column: string,
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar';
	transaction?: Array<Prisma.Prisma__MediaClient<Media, never>>,
	only?: Array<'colorPalette' | 'blurHash'>;
}) => {

	const models = {
		movie: movies,
		tv: tvs,
		season: seasons,
		episode: episodes,
		person: people,
		media: medias,
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

	const query = mediaDb.select()
		.from(models[table])
		.where(eq(models[table][column], src))
		.get();

	if (query?.blurHash && query?.colorPalette && existsSync(`${imagesPath}/${imageSizes[0].size}${newFile}`)) {
		return;
	}

	await downloadImage({
		url: `https://image.tmdb.org/t/p/${imageSizes[0].size}${src}`,
		path: `${imagesPath}/${imageSizes[0].size}${newFile}`,
		usableImageSizes: usableImageSizes,
		only: only,
	})
		.then(({ colorPalette, blurHash }) => {

			try {
				mediaDb.update(models[table])
					.set({
						colorPalette: colorPalette && (!only || only.includes('colorPalette'))
							? JSON.stringify(colorPalette)
							: undefined,
						blurHash: blurHash && (!only || only.includes('blurHash'))
							? blurHash
							: undefined,
					 })
					.where(eq(models[table][column], src))
					.returning();
			} catch (e) {
				console.log(e);
			}

		})
		.catch(e => console.log(table, e));

};

