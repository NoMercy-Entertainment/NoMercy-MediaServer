/* eslint-disable indent */

import { InfoCredit, MediaItem } from '../../types/server';

import { Media } from '@server/db/media/actions/medias';
import colorPalette from '@server/functions/colorPalette';
import { Movie } from '@server/providers/tmdb/movie';
import { Image } from '@server/providers/tmdb/shared';
import { TvShow } from '@server/providers/tmdb/tv';

const fetchMissingColorPalettes = false;

export const priority = {
	Trailer: 1,
	Clip: 2,
	'Featurette': 3,
	'Behind the Scenes': 4,
	'Opening Credits': 5,
} as const;


export const relatedMap = async (data: any, type: string) => {
	const res: any[] = [];

	for (const s of data ?? []) {

		const index = data.indexOf(s);

		res.push({
			backdrop: s.backdrop,
			id: s.media_id ?? s.id as number,
			overview: s.overview,
			poster: s.poster,
			title: s.title,
			titleSort: s.titleSort,
			mediaType: type,
			numberOfEpisodes: s[`${type.toUcFirst()}_to`]?.numberOfEpisodes ?? null,
			haveEpisodes: s[`${type.toUcFirst()}_to`]?.haveEpisodes ?? null,
			color_palette: (s as Media).colorPalette
				?				JSON.parse((s as Media).colorPalette ?? '{}')
				:				fetchMissingColorPalettes
					?					{
						poster: index < 10 && (s as any).poster
							?							await colorPalette(`https://image.tmdb.org/t/p/w185${(s as any).poster}`)
							:							null,
						backdrop: index < 10 && (s as any).backdrop
							?							await colorPalette(`https://image.tmdb.org/t/p/w185${(s as any).backdrop}`)
							:							null,
					}
					:					null,
		});
	}
	return res;
};

export const imageMap = async <T = Media | TvShow | Movie | Image>(data: T[]) => {
	const res: MediaItem[] = [];

	for (const i of data ?? []) {

		const index = data.indexOf(i);

		res.push({
			height: (i as Media).height,
			id: (i as Media).id!,
			// @ts-ignore
			src: (i as Media).src ?? (i as Media).filePath ?? (i as TvShow | Movie).file_path,
			width: (i as Media).width ?? null,
			voteAverage: (i as Media).voteAverage ?? (i as TvShow | Movie).vote_average,
			voteCount: (i as Media).voteCount ?? (i as TvShow | Movie).vote_count,
			color_palette: (i as Media).colorPalette
				?				JSON.parse((i as Media).colorPalette ?? '{}')
				:				index < 10 && (i as any).file_path && fetchMissingColorPalettes
					?					await colorPalette(`https://image.tmdb.org/t/p/w185${(i as any).file_path}`)
					:					null,
		});
	}
	return res;
};

export const peopleMap = async (data: Credit[], filter: string): Promise<InfoCredit[]> => {
	const res: InfoCredit[] = [];

	for (const c of data ?? []) {

		const index = data.indexOf(c);

		const item = c.person ?? c;

		res.push({
			// @ts-ignore
			character: c[filter]?.map(c => c.character || c.job || 'unknown')
				?.join(', ') ?? item.character ?? item.job ?? 'unknown',
			profilePath: (c as any).Image?.filePath ?? item.profilePath ?? item.profile,
			gender: item.gender,
			id: item.id,
			knownForDepartment: item.knownForDepartment,
			name: item.name,
			popularity: item.popularity,
			deathDay: item.deathDay ?? undefined,
			colorPalette: item.color_palette
				?				JSON.parse(item.color_palette ?? '{}')
				:				index < 10 && (c as any).file_path && fetchMissingColorPalettes
					?					await colorPalette(`https://image.tmdb.org/t/p/w185${(c as any).Image?.filePath ?? item.profilePath ?? item.profile}`)
					:					null,
		});
	}
	

	return res;
};

export type Credit = {
	person: {
		gender: number | null;
		id: number;
		knownForDepartment: string | null;
		name: string | null;
		popularity: number | null;
		deathDay: string | null;
		color_palette: string | null;
		profilePath?: string | null;
		profile: string | null;
	};
	jobs: {
		crew_id: string | null;
		job: string;
	}[];
	id: string;
	person_id: number;
} | {
	person: {
		gender: number | null;
		id: number;
		knownForDepartment: string | null;
		name: string | null;
		popularity: number | null;
		deathDay: string | null;
		color_palette: string | null;
		profilePath?: string | null;
		profile: string | null;
	};
	roles: {
		cast_id: string | null;
		character: string;
	}[];
	id: string;
	person_id: number;
};

export const getFromDepartmentMap = (data: Credit[], type: string, filter: string) => {
	return data?.filter(c => !!c[`${type}s`].find((d: { [x: string]: string; }) => d[type] == filter))
		.filter(Boolean)
		.slice(0, 3)
		.map(c => ({
			id: c.person?.id,
			name: c.person?.name,
			// blurHash: c.person?.blurHash,
			color_palette: c.person?.colorPalette,
		})) ?? [];
};
