import { Request, Response } from 'express';

import { confDb } from '../../../database/config';
import { Collection, Prisma } from '../../../database/config/client';
import { sortBy, unique } from '../../../functions/stringArray';
import { getLanguage } from '../../middleware';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

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
			type: 'collection',
			mediaType: 'collection',
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
			collectionId: { in: ids },
			iso6391: language,
		},
	});
};
