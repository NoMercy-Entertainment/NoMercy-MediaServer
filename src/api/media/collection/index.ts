import { Request, Response } from 'express';
import collection, { Collection } from '../../../providers/tmdb/collection/index';
import { sortBy, unique } from '../../../functions/stringArray';

import Logger from '../../../functions/logger';
import { Prisma } from '@prisma/client';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';
import {movie} from '../../../providers/tmdb/movie/index';
import { moviePopular } from '../../../providers/tmdb/movie/index';

export default async function (req: Request, res: Response) {

	const language = req.acceptsLanguages()[0] != 'undefined' 
		? req.acceptsLanguages()[0].split('-')[0] 
		: 'en';
		
	const servers = req.body.servers
		?.filter((s: string | any[]) => !s.includes(deviceId)) ?? [];

	const external: any[] = [];
	const translation: any[] = [];
	const ids: any[] = [];
	let collections: Collection[] = [];

	await Promise.all([
		moviePopular()
			.then(async (data) => {
				for (let m of data.slice(0,5)) {
					await movie(m.id)
						.then(async (movie) => {
							if(!movie.belongs_to_collection?.id) return;

							await collection(movie.belongs_to_collection?.id)
								.then(async (data) => {
									collections.push(data);
								})
								.catch((error) => {
									Logger.log({
										level: 'error',
										name: 'moviedb',
										color: 'redBright',
										message: 'Error fetching Collection ' + error,
									});
								})
							
						})
						.catch((error) => {
							Logger.log({
								level: 'error',
								name: 'moviedb',
								color: 'redBright',
								message: 'Error fetching Movie ' + error,
							});
						})
				}
			})
			.catch((error) => {
				Logger.log({
					level: 'error',
					name: 'moviedb',
					color: 'redBright',
					message: 'Error fetching popular Movies ' + error,
				});
			}),

		confDb.collection.findMany(collectionQuery)
			.then(data => ids.push(...data.map(d => d.id)))
			.finally(async () => {
				await confDb.translation.findMany(translationQuery({ ids, language }))
					.then(data => translation.push(...data));
			}),
	]);

	const data = collections.map((collection) => {

		const name = translation
			.find(t => t.translationable_type == 'collection' && t.translationable_id == collection.id)?.name || collection.name;

		// const files = [
		// 	...tv.season.filter(t => t.season_number > 0).map(s => s.episode.map(e => e.video_file).flat())
		// 		.flat()
		// 		.map(f => f.episodeId),
		// 	...external?.find(t => t.id == tv.id && t.files)?.files ?? [],
		// ]
		// 	.filter((v, i, a) => a.indexOf(v) === i);

		// delete tv.season;

		const number = Math.floor(Math.random() * 155) + 1;
		const newNumber = Math.floor(Math.random() * number) + 1;

		return {
			...collection,
			name: name[0].toUpperCase() + name.slice(1),
			// title_sort: createTitleSort(title[0].toUpperCase() + title.slice(1)),
			type: 'collections',
			media_type: 'collections',
			have_episodes: newNumber,
			number_of_episodes: number,
			// files: servers?.length > 0 ? undefined : files,
		};
	});

	collections = unique([
		...data,
		...external,
	], 'id');

	const body = sortBy(collections, 'title_sort');

	return res.json(body);

}

const collectionQuery = Prisma.validator<Prisma.CollectionFindManyArgs>()({
	where: {
		parts: {
			gt: 0,
		},
	},
	include: {
		Movie: true,
	},
});

const translationQuery = ({ ids, language }) => {
	return Prisma.validator<Prisma.TranslationFindManyArgs>()({
		where: {
			translationableId: { in: ids },
			iso6391: language,
			translationableType: 'tv',
		},
	});
};
