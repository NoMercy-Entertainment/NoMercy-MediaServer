import { Request, Response } from 'express';
import { sortBy, unique } from '../../functions/stringArray';

import Logger from '../../functions/logger';
import { Prisma } from '@prisma/client'
import { confDb } from '../../database/config';
import { deviceId } from '../../functions/system';
import { tvPopular } from '../../providers/tmdb/tv/index';

// import { createTitleSort } from '../../functions/stringArray';

export default async function (req: Request, res: Response) {

	const language = req.acceptsLanguages()[0] != 'undefined' 
		? req.acceptsLanguages()[0].split('-')[0] 
		: 'en';
		
	const servers = req.body.servers
		?.filter((s: string | any[]) => !s.includes(deviceId)) ?? [];

	const external: any[] = [];
	const translation: any[] = [];
	const ids: any[] = [];
	let tvs: any[] = [];

	await Promise.all([

		tvPopular()
		.then(data => {
			tvs.push(...data);
		})
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'MovieDB',
				color: 'redBright',
				message: 'Error fetching popular TV Shows' + error,
			});
		}),

		confDb.tv.findMany(tvQuery)
			.then(data => ids.push(...data.map(d => d.id)))
			.finally(async () => {
				await confDb.translation.findMany(translationQuery({ ids, language }))
					.then(data => translation.push(...data));
			}),
	]);

	const data = tvs.map((tv) => {

		const name = translation
			.find(t => t.translationable_type == 'tv' && t.translationable_id == tv.id)?.name || tv.name;

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
			...tv,
			// id: tv.id,
			// poster: tv.poster_path,
			name: name[0].toUpperCase() + name.slice(1),
			// title_sort: createTitleSort(title[0].toUpperCase() + title.slice(1)),
			type: 'tv',
			media_type: 'tv',
			have_episodes: newNumber,
			number_of_episodes: number,
			// files: servers?.length > 0 ? undefined : files,
		};
	});

	tvs = unique([
		...data,
		...external,
	], 'id');

	const body = sortBy(tvs, 'title_sort');

	return res.json(body);

}

const tvQuery = Prisma.validator<Prisma.TvFindManyArgs>()({
	where: {
		mediaType: 'anime',
		haveEpisodes: {
			gt: 0,
		},
	},
	include: {
		Season: {
			orderBy: {
				seasonNumber: 'asc',
			},
			include: {
				Episode: {
					orderBy: {
						episodeNumber: 'asc',
					},
					where: {
						VideoFile: {
							some: {
								duration: {
									not: null,
								},
							},
						},
					},
					include: {
						VideoFile: true,
					},
				},
			},
		},
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
