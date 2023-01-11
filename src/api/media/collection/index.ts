import { Collection, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { sortBy, unique } from '../../../functions/stringArray';

import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default async function (req: Request, res: Response) {

	const language = req.acceptsLanguages()[0] == 'undefined'
		? 'en'
		: req.acceptsLanguages()[0].split('-')[0];

	const servers = req.body.servers
		?.filter((s: string | any[]) => !s.includes(deviceId)) ?? [];

	const external: any[] = [];
	const translation: any[] = [];
	let collections: any[] = [];

	await confDb.collection.findMany(collectionQuery)
			.then(data => collections.push(...data));

	await Promise.all([
		// moviePopular()
		// 	.then(async (data) => {
		// 		for (let m of data.slice(0,5)) {
		// 			await movie(m.id)
		// 				.then(async (movie) => {
		// 					if(!movie.belongs_to_collection?.id) return;

		// 					await collection(movie.belongs_to_collection?.id)
		// 						.then(async (data) => {
		// 							collections.push(data);
		// 						})
		// 						.catch((error) => {
		// 							Logger.log({
		// 								level: 'error',
		// 								name: 'moviedb',
		// 								color: 'redBright',
		// 								message: 'Error fetching Collection ' + error,
		// 							});
		// 						})

		// 				})
		// 				.catch((error) => {
		// 					Logger.log({
		// 						level: 'error',
		// 						name: 'moviedb',
		// 						color: 'redBright',
		// 						message: 'Error fetching Movie ' + error,
		// 					});
		// 				})
		// 		}
		// 	})
		// 	.catch((error) => {
		// 		Logger.log({
		// 			level: 'error',
		// 			name: 'moviedb',
		// 			color: 'redBright',
		// 			message: 'Error fetching popular Movies ' + error,
		// 		});
		// 	}),

		confDb.translation.findMany(translationQuery({ ids: collections.map(d => d.id), language }))
			.then(data => translation.push(...data)),
	]);

	const data = collections.map((collection: Collection) => {

		const title = translation
			.find(t => t.translationable_type == 'collection' && t.translationable_id == collection.id)?.name || collection.title;

		// const files = [
		// 	...tv.season.filter(t => t.season_number > 0).map(s => s.episode.map(e => e.video_file).flat())
		// 		.flat()
		// 		.map(f => f.episodeId),
		// 	...external?.find(t => t.id == tv.id && t.files)?.files ?? [],
		// ]
		// 	.filter((v, i, a) => a.indexOf(v) === i);

		// delete tv.season;

		return {
			...collection,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: collection.titleSort,
			blurHash: collection.blurHash
? JSON.parse(collection.blurHash)
: null,
			have_parts: collection.parts,
			type: 'movie',
			mediaType: 'collections',
		};
	});

	collections = unique([
		...data,
		...external,
	], 'id');

	const body = sortBy(collections, 'titleSort');

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
			translationableType: 'collection',
		},
	});
};
