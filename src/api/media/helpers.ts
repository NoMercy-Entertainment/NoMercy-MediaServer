/* eslint-disable indent */

import {
	InfoCredit,
	MediaItem
} from '../../types/server';

import { Media } from '@server/db/media/actions/medias';
import { Image } from '@server/providers/tmdb/shared/image';

export const relatedMap = (data: any, type: string) => data.map((s) => {
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

export const imageMap = <T = Media | Image>(data: T[]) => {
	const res: MediaItem[] = [];

	for (const i of data ?? []) {

		res.push({
			aspectRatio: (i as Media).aspectRatio ?? (i as Image).aspect_ratio,
			height: (i as Media).height,
			id: (i as Media).id!,
			iso6391: (i as Media).iso6391 ?? (i as Image).iso_639_1,
			// @ts-ignore
			src: (i as Media).src ?? (i as Media).filePath ?? (i as Image).file_path,
			width: (i as Media).width ?? null,
			blurHash: (i as Media).blurHash,
			colorPalette: JSON.parse((i as Media).colorPalette ?? '{}'),
			voteAverage: (i as Media).voteAverage ?? (i as Image).vote_average,
			voteCount: (i as Media).voteCount ?? (i as Image).vote_count,
		});
	}
	return res;
};

export const peopleMap = (data: Credit[], filter: string): InfoCredit[] => {
	return data.map((c) => {
		return {
			gender: c.person.gender,
			id: c.person.id,
			creditId: c[filter]?.[0].creditId,
			character: c[filter]?.map(c => c.character || c.job || 'unknown')?.join(', '),
			knownForDepartment: c.person.knownForDepartment,
			name: c.person.name,
			profilePath: (c as any).Image?.filePath ?? c.person.profile,
			popularity: c.person.popularity,
			deathday: c.person.deathday ?? undefined,
			// blurHash: c.person.blurHash,
			colorPalette: JSON.parse(c.person.colorPalette ?? '{}'),
		};
	}) ?? [];
};

export type Credit = {
    person: {
		gender: number | null;
		id: number;
		knownForDepartment: string | null;
		name: string | null;
		popularity: number | null;
		deathday: string | null;
		colorPalette: string | null;
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
		deathday: string | null;
		colorPalette: string | null;
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
			name: c.person?.name!,
			// blurHash: c.person?.blurHash,
			colorPalette: c.person?.colorPalette,
		})) ?? [];
};
