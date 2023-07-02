/* eslint-disable indent */

import {
	InfoCredit,
	MediaItem
} from '../../types/server';

import { Image as TMDBImage } from '../../providers/tmdb/shared';
import { MovieWithRelations } from '@/db/media/actions/movies';
import { Cast } from '@/db/media/actions/casts';
import { Person } from '@/db/media/actions/people';
import { Role } from '@/db/media/actions/roles';
import { Crew } from '@/db/media/actions/crews';
import { Job } from '@/db/media/actions/jobs';

export const relatedMap = (data: MovieWithRelations['similar_from'] | MovieWithRelations['recommendation_from'], type: string) => data.map((s) => {
	return {
		backdrop: s.backdrop,
		id: s.media_id as number,
		overview: s.overview,
		poster: s.poster,
		title: s.title,
		titleSort: s.titleSort,
		mediaType: type,
		numberOfEpisodes: s[`${type.toUcFirst()}_to`]?.numberOfEpisodes ?? null,
		haveEpisodes: s[`${type.toUcFirst()}_to`]?.haveEpisodes ?? null,
		blurHash: JSON.parse(s.blurHash ?? '{}'),
		colorPalette: JSON.parse(s.colorPalette ?? '{}'),
	};
}) ?? [];

export const imageMap = (data: MovieWithRelations['images'] | TMDBImage[]) => {
	const res: MediaItem[] = [];

	for (const i of data ?? []) {

		// if (((i as MovieWithRelations['images'][0]).filePath ?? (i as TMDBImage).file_path) != null && (i as MovieWithRelations['images'][0]).colorPalette === null) {
		// 	(i as MovieWithRelations['images'][0]).colorPalette = JSON.stringify(await colorPalette(`https://image.tmdb.org/t/p/w92${(i as MovieWithRelations['images'][0]).filePath}` ?? (i as TMDBImage).file_path) ?? {});
		// }

		res.push({
			aspectRatio: (i as MovieWithRelations['images'][0]).aspectRatio ?? (i as TMDBImage).aspect_ratio,
			height: i.height,
			id: (i as MovieWithRelations['images'][0]).id!,
			iso6391: (i as MovieWithRelations['images'][0]).iso6391 ?? (i as TMDBImage).iso_639_1,
			src: (i as MovieWithRelations['images'][0]).filePath ?? (i as TMDBImage).file_path,
			width: i.width ?? null,
			blurHash: (i as MovieWithRelations['images'][0]).blurHash,
			colorPalette: JSON.parse((i as MovieWithRelations['images'][0]).colorPalette ?? '{}'),
			voteAverage: (i as MovieWithRelations['images'][0]).voteAverage ?? (i as TMDBImage).vote_average,
			voteCount: (i as MovieWithRelations['images'][0]).voteCount ?? (i as TMDBImage).vote_count,
		});
	}
	return res;
};

export type Credit = Cast & {
	person: Person | undefined;
	roles: Role[];
} | Crew & {
	person: Person | undefined;
	jobs: Job[];
}

export const peopleMap = (data: Credit[], filter: string): InfoCredit[] => {
	return data.map((c) => {
		return {
			gender: c.person!.gender,
			id: c.person!.id,
			creditId: c[filter]?.[0].creditId,
			character: c[filter]?.map(c => c.character || c.job || 'unknown')?.join(', '),
			knownForDepartment: c.person!.knownForDepartment,
			name: c.person!.name,
			profilePath: (c as any).Image?.filePath ?? c.person?.profile,
			popularity: c.person!.popularity,
			deathday: c.person!.deathday,
			blurHash: c.person!.blurHash,
			colorPalette: JSON.parse(c.person!.colorPalette ?? '{}'),
		};
	}) ?? [];
};

export type Department = (Crew & {
	person: Person | null;
	jobs: Job[];
})

export const getFromDepartmentMap = (data: Credit[], type: string, filter: string) => {
	return data?.filter(c => !!c[`${type}s`].find((d: { [x: string]: string; }) => d[type] == filter))
		.filter(Boolean)
		.slice(0, 3)
		.map(c => ({
			id: c.person!.id,
			name: c.person!.name!,
			blurHash: c.person!.blurHash,
			colorPalette: c.person!.colorPalette,
		})) ?? [];
};
