import { Request, Response } from 'express-serve-static-core';
import { groupBy, mappedEntries, unique } from '@server/functions/stringArray';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { selectFromUserData } from '@server/db/media/actions/userData';
import { Movie } from '@server/db/media/actions/movies';
import { Tv } from '@server/db/media/actions/tvs';
import { parseYear } from '@server/functions/dateTime';
import { priority } from '@server/api/media/helpers';

export default function(req: Request, res: Response) {

	const result = selectFromUserData({
		user_id: req.user.sub,
		language: req.language,
	});

	const datas = mappedEntries(groupBy(result, 'type'))
		.map((d) => {
			if (d[0] == 'tv') {
				return {
					type: unique(d[1], 'tv_id'),
				};
			}
			if (d[0] == 'movie') {
				return {
					type: unique(d[1], 'movie_id'),
				};
			}
			if (d[0] == 'special') {
				return {
					type: unique(d[1], 'special_id'),
				};
			}
		});

	const data: any[] = [];

	for (const t of datas) {

		t?.type?.map((d) => {
			const x = d?.special ?? d?.tv ?? d?.movie;
			if (!x) return;

			data.push({
				id: x.id,
				mediaType: d.type,
				poster: x.poster,
				backdrop: x.backdrop,
				title: x.title[0].toUpperCase() + x.title.slice(1),
				titleSort: createTitleSort(x.title),
				type: d.type,
				updatedAt: x.updated_at,
				color_palette: x.colorPalette
					?					{
						...JSON.parse(x.colorPalette),
						logo: d.images.at(0)?.colorPalette
							?							JSON.parse(d.images.at(0)!.colorPalette!)
							:							null,
					}
					:					null,

				year: parseYear((x as Movie).releaseDate ?? (x as Tv).firstAirDate),
				haveEpisodes: (x as Tv)?.haveEpisodes,
				overview: (x as Tv).overview,
				logo: d.images.at(0)?.filePath,
				rating: d.certification,
				videoId: d?.medias.at(0)?.src,
				videos: d.medias?.map((v) => {
					return {
						src: v.src,
						type: v.type!,
						name: v.name!,
						site: v.site!,
						size: v.size!,
					};
				})
					.sort((a, b) => a.size - b.size)
					.sort(<T extends { type: string }>(a: T, b: T) => {
						return (priority as any)[a.type] - (priority as any)[b.type];
					}),
			});
		}) ?? [];
	}

	return res.json(data);
}
