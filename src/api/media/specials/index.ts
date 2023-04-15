import { Request, Response } from 'express';

import { Prisma } from '../../../database/config/client';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';
import { unique } from '../../../functions/stringArray';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

	const servers = req.body.servers
		?.filter((s: string | any[]) => !s.includes(deviceId)) ?? [];

	const external: any[] = [];
	const translation: any[] = [];
	let specials: any[] = [];

	await Promise.all([

		confDb.special.findMany(specialQuery)
			.then(data => specials.push(...data)),
		// .finally(async () => {
		// 	await confDb.translation.findMany(translationQuery({ ids: specials.map(s => s.id), language }))
		// 		.then(data => translation.push(...data));
		// }),
	]);

	const data = specials.map((special) => {

		const name = translation
			.find(t => t.translationable_type == 'tv' && t.translationable_id == special.id)?.name ?? special.title;

		return {
			...special,
			title: name,
			titleSort: createTitleSort(name),
			blurHash: special.blurHash
				? JSON.parse(special.blurHash)
				: null,
			type: 'special',
			mediaType: 'special',
		};
	});

	specials = unique([
		...data,
		...external,
	], 'id');

	return res.json(specials);

};

const specialQuery = Prisma.validator<Prisma.SpecialFindManyArgs>()({
	// where: {
	// },
	// include: {
	// },
});
