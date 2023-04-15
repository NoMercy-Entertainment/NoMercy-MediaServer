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
import { confDb } from '../../database/config';
import downloadImage from '../../functions/downloadImage';
import { imagesPath } from '@/state';

export const image = async (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | MovieAppend | PersonAppend | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar'
) => {
	if (!req.images[`${type}s`]) return;

	const lang = useSelector((state: AppState) => state.config.language);

	for (const image of req.images[`${type}s`] as Array<Image>) {

		const mediaInsert = Prisma.validator<Prisma.MediaUncheckedCreateInput>()({
			aspectRatio: image.aspect_ratio,
			height: image.height,
			iso6391: image.iso_639_1,
			src: image[`${type}_path`] ?? image.file_path,
			type: type,
			voteAverage: image.vote_average,
			voteCount: image.vote_count,
			width: image.width,
			episodeId: table == 'episode'
				? req.id
				: undefined,
			movieId: table == 'movie'
				? req.id
				: undefined,
			personId: table == 'person'
				? req.id
				: undefined,
			seasonId: table == 'season'
				? req.id
				: undefined,
			tvId: table == 'tv'
				? req.id
				: undefined,
			videoFileId: table == 'video'
				? req.id
				: undefined,
		});

		transaction.push(
			confDb.media.upsert({
				where: {
					src: image[`${type}_path`] ?? image.file_path,
				},
				update: mediaInsert,
				create: mediaInsert,
			})
		);

		const query = await confDb.media.findFirst({
			where: {
				src: image[`${type}_path`] ?? image.file_path,
			},
		});

		if (!query || (['en', lang, null].includes(image.iso_639_1) && !query?.blurHash && !query?.colorPalette)) {
			await downloadAndHash({
				src: image.file_path,
				table: 'media',
				column: 'src',
				type: type,
				only: ['colorPalette', 'blurHash'],
			});
		}
	}
};

export const downloadAndHash = async ({ src, table, column, type, transaction, only }: {
	src: string,
	column: string,
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar'
	transaction?: Array<Prisma.Prisma__MediaClient<Media, never>>,
	only?: Array<'colorPalette' | 'blurHash'>
// eslint-disable-next-line require-await
}) => {

	const queue = useSelector((state: AppState) => state.config.dataWorker);

	// await queue.add({
	// 	file: __filename,
	// 	fn: 'execute',
	// 	args: { src, table, column, type, transaction, only },
	// });
};

export const execute = async ({ src, table, column, type, transaction, only }:	{
	src: string,
	column: string,
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile' | 'cast' | 'crew' | 'season' | 'episode',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video' | 'media' | 'guestStar'
	transaction?: Array<Prisma.Prisma__MediaClient<Media, never>>,
	only?: Array<'colorPalette' | 'blurHash'>
}) => {

	const hasTransaction = !!transaction;

	if (!transaction) {
		transaction = new Array<Prisma.Prisma__MediaClient<Media, never>>();
	}

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

	const query = await confDb[table].findFirst({
		where: {
			[column]: src,
		},
	});

	if (query?.blurHash && query?.colorPalette && existsSync(`${imagesPath}/${imageSizes[0].size}${newFile}`)) {
		return;
	}

	const startTime = Date.now();

	await downloadImage({
		url: `https://image.tmdb.org/t/p/${imageSizes[0].size}${src}`,
		path: `${imagesPath}/${imageSizes[0].size}${newFile}`,
		usableImageSizes: usableImageSizes,
		only: only,
	})
		.then(async ({ colorPalette, blurHash }) => {
			while (!(await confDb[table].findFirst({ where: { [column]: src } }))?.id) {
				const now = Date.now();
				if (now - startTime > 1000 * 60 * 5) {
					// console.log({ where: { [column]: src } });
					return new Error('timeout downloadAndHash');
				}
			}
			console.log(table);
			// transaction!.push(
			await confDb[table].update({
				where: {
					id: (await confDb[table].findFirst({ where: { [column]: src } }))?.id,
				},
				data: {
					colorPalette: colorPalette && (!only || only.includes('colorPalette'))
						? JSON.stringify(colorPalette)
						: undefined,
					blurHash: blurHash && (!only || only.includes('blurHash'))
						? blurHash
						: undefined,
				},
			});
			// );
		})
		.catch(e => console.log(table, e));

	if (!hasTransaction) {
		// while (await checkDbLock()) {
		// 	//
		// }
		// await confDb.$transaction(transaction).catch(e => console.log(e));
	}
};

