import { Collection, Prisma } from '../../../database/config/client';
import { Request, Response } from 'express';
import { sortBy, unique } from '../../../functions/stringArray';

import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

	const servers = req.body.servers
		?.filter((s: string | any[]) => !s.includes(deviceId)) ?? [];

	const external: any[] = [];
	const translation: any[] = [];
	let collections: any[] = [];

	await confDb.collection.findMany(collectionQuery)
		.then(data => collections.push(...data));

	await Promise.all([
		confDb.translation.findMany(translationQuery({ ids: collections.map(d => d.id), language }))
			.then(data => translation.push(...data)),
	]);

	const data = collections.map((collection: Collection) => {

		const title = translation
			.find(t => t.translationable_type == 'collection' && t.translationable_id == collection.id)?.name || collection.title;

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
