// artists, releases, isrcs, url-

import { Genre } from '../genre';
import Logger from '../../../functions/logger';
import mbApiClient from '../mbApiClient';

export interface Recording {
	video: boolean;
	disambiguation: string;
	id: string;
	'first-release-date': Date;
	title: string;
	length: number;
}

export interface Credit {
	joinphrase: string;
	name: string;
	artist: Artist;
}

export interface Artist {
	disambiguation: string;
	'type-id': null | string;
	tags?: Tag[];
	id: string;
	name: string;
	aliases?: Alias[];
	'sort-name': string;
	type: null | string;
	'label-code'?: null;
	rating?: Rating;
	'iso-3166-1-codes'?: string[];
	'iso-3166-2-codes'?: string[];
}

export interface Alias {
	end: null;
	name: string;
	'sort-name': string;
	type: null | string;
	begin: null;
	locale: null | string;
	ended: boolean;
	'type-id': null | string;
	primary: boolean | null;
}

export interface Rating {
	value: number;
	'votes-count': number;
}

export interface Tag {
	name: string;
	count: number;
}

export interface Relation {
	'attribute-values': Attribute;
	end: null | string;
	'attribute-ids': AttributeIds;
	type: string;
	'attribute-credits'?: Attribute;
	ended: boolean;
	direction: string;
	'target-credit': string;
	begin: null | string;
	artist?: Artist;
	'type-id': string;
	'target-type': string;
	attributes: string[];
	'source-credit': string;
	label?: Artist;
	work?: Work;
	genre: Genre[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Attribute {
	//
}

export interface AttributeIds {
	strings?: string;
	assistant?: string;
	additional?: string;
	'lead vocals'?: string;
}

export interface Work {
	disambiguation: string;
	'type-id': string;
	language: string;
	languages: string[];
	attributes: any[];
	iswcs: string[];
	id: string;
	title: string;
	type: string;
}

export interface Release {
	'packaging-id': null | string;
	'release-events': ReleaseEvent[];
	disambiguation: string;
	'status-id': null | string;
	status: null | string;
	tags: Tag[];
	country: null | string;
	'artist-credit': Credit[];
	'text-representation': TextRepresentation;
	media: Media[];
	packaging: null | string;
	date: string;
	quality: string;
	aliases: any[];
	id: string;
	title: string;
	barcode: null | string;
}

export interface Media {
	position: number;
	'track-offset': number;
	title: string;
	'format-id': string;
	tracks: Track[];
	discs: Disc[];
	format: string;
	'track-count': number;
}

export interface Disc {
	id: string;
	'offset-count': number;
	offsets: number[];
	sectors: number;
}

export interface Track {
	'artist-credit': Credit[];
	title: string;
	id: string;
	length: number;
	number: string;
	position: number;
}

export interface ReleaseEvent {
	area: Artist | null;
	date: string;
}

export interface TextRepresentation {
	script: null | string;
	language: null | string;
}

export interface RecordingAppend extends Recording {
	aliases: any[];
	annotation: string;
	'artist-credit': Credit[];
	rating: Rating;
	relations: Relation[];
	releases: Release[];
	tags: Tag[];
    genres: Genre[];
}

export const recordingAppend = [
	'aliases',
	'annotation',
	'artist-credit',
	'genres',
	'rating',
	'relations',
	'releases',
	'tags',
] as const;

export type RecordingWithAppends<T extends keyof RecordingAppend> = Recording & Pick<RecordingAppend, T>;

export const recording = async (id: string) => {
	Logger.log({
		level: 'info',
		name: 'musicBrainz',
		color: 'blue',
		message: `Fetching Recording id: ${id}`,
	});

	const params = {
		params: {
			inc: [
				'artist-credits',
				'artists',
				'releases',
				'tags',
				'genres',
			].join('+'),
		},
	};

	const response = await mbApiClient.get<RecordingWithAppends<typeof recordingAppend[number]>>(`recording/${id}`, params);

	return response.data;
};
