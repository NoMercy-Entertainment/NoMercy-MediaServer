

// recordings, releases, release-groups, works

import Logger from '@server/functions/logger/logger';
import mbApiClient from '../mbApiClient';
import { Genre } from '../genre';

export interface Artist {
    disambiguation: string;
    'life-span': LifeSpan;
    id: string;
    isnis: string[];
    gender: string;
    'release-groups': ReleaseGroup[];
    'sort-name': string;
    name: string;
    area: Area;
    country: string;
    'end-area': null;
    ipis: string[];
    'gender-id': string;
    end_area: null;
    'begin-area': Area;
    begin_area: Area;
    releases: Release[];
    'type-id': string;
    type: string;
    recordings: Recording[];
    works: Work[];
}

export interface Area {
    name: string;
    'iso-3166-1-codes'?: string[];
    type: null;
    'sort-name': string;
    id: string;
    disambiguation: string;
    'type-id': null;
}

export interface LifeSpan {
    end: null;
    begin: string;
    ended: boolean;
}

export interface Recording {
    title: string;
    length: number | null;
    video: boolean;
    disambiguation: string;
    id: string;
}

export interface ReleaseGroup {
    disambiguation: string;
    id: string;
    title: string;
    releases: any[];
    'primary-type-id': string;
    'secondary-type-ids': string[];
    'first-release-date': string;
    'secondary-types': string[];
    'primary-type': string;
}

export interface Release {
    'text-representation': TextRepresentation;
    date: string;
    'status-id': null | string;
    quality: string;
    media: Media[];
    title: string;
    status: string | null;
    barcode: null | string;
    packaging: null | string;
    'packaging-id': null | string;
    country: null | string;
    disambiguation: string;
    'release-group': null;
    id: string;
    'release-events': ReleaseEvent[];
}


export interface Media {
    position: number;
    format: string | null;
    'track-count': number;
    'format-id': null | string;
    title: string;
}


export interface ReleaseEvent {
    date: string;
    area: Area | null;
}

export interface TextRepresentation {
    language: string | null;
    script: string | null;
}

export interface Work {
    attributes: any[];
    language: string | null;
    type: null;
    title: string;
    'type-id': null;
    disambiguation: string;
    id: string;
    languages: string[];
    iswcs: string[];
}

export interface ArtistAppend extends Artist {
	recordings: Recording[];
    releases: Release[];
    'release-groups': ReleaseGroup[];
    works: Work[];
    genres: Genre[];
}

export const artistAppend = [
	'genres',
	'recordings',
	'releases',
	'release-groups',
	'works',
] as const;

export type ArtistWithAppends<T extends keyof ArtistAppend> = Artist & Pick<ArtistAppend, T>;

export const artist = async (id: string) => {
	Logger.log({
		level: 'info',
		name: 'musicBrainz',
		color: 'blue',
		message: `Fetching Artist id: ${id}`,
	});

	const params = {
		params: {
			inc: [
				'genres',
				'recordings',
				'releases',
				'release-groups',
				'works',
			].join('+'),
		},
	};

	const response = await mbApiClient.get<ArtistWithAppends<typeof artistAppend[number]>>(`artist/${id}`, params);

	return response.data;
};
