import { Covers } from '../cover';
import { Genre } from '../genre';
import axios from 'axios';
import logger from '@server/functions/logger';
import mbApiClient from '../mbApiClient';

export interface Release {
    asin: null;
    barcode: null;
    country: null;
    'cover-art-archive': CoverArtArchive;
    date: Date;
    disambiguation: string;
    id: string;
    packaging: string;
    'packaging-id': string;
    quality: string;
    'release-events': ReleaseEvent[];
    status: string;
    'status-id': string;
    'text-representation': TextRepresentation;
    title: string;
}

export interface CoverArtArchive {
    artwork: boolean;
    darkened: boolean;
    back: boolean;
    front: boolean;
    count: number;
}

export interface ReleaseEvent {
	area: null;
	date: Date;
}

export interface TextRepresentation {
	language: string;
	script: string;
}

export interface ArtistCredit {
    joinphrase: string;
    artist: Artist;
    name: string;
}

export interface Artist {
    'type-id': string;
    type: string;
    tags?: Tag[];
    name: string;
    genres?: Genre[];
    id: string;
    'sort-name': string;
    aliases: Alias[];
    disambiguation: string;
}

export interface Alias {
    'sort-name': string;
    locale: null | string;
    end: null;
    name: string;
    type: null | string;
    'type-id': null | string;
    begin: null;
    primary: boolean | null;
    ended: boolean;
}

export interface Tag {
    name: string;
    count: number;
}

export interface Collection {
    'release-count': number;
    id: string;
    'type-id': string;
    type: string;
    editor: string;
    name: string;
    'entity-type': string;
}

export interface CoverArtArchive {
    darkened: boolean;
    back: boolean;
    count: number;
    artwork: boolean;
    front: boolean;
}

export interface LabelInfo {
    label: Label;
    'catalog-number': string;
}

export interface Label {
    aliases: Alias[];
    disambiguation: string;
    id: string;
    'sort-name': string;
    genres: Genre[];
    'type-id': string;
    type: string;
    'label-code': number;
    tags: Tag[];
    name: string;
}

export interface Media {
    'track-count': number;
    format: string;
    position: number;
    discs: any[];
    tracks: Track[];
    'format-id': string;
    'track-offset': number;
    title: string;
}

export interface Track {
    recording: TrackRecording;
    'artist-credit': ArtistCredit[];
    length: number;
    id: string;
    number: string;
    title: string;
    position: number;
}

export interface TrackRecording {
    isrcs: string[];
    id: string;
    disambiguation: string;
    'first-release-date': Date;
    title: string;
    relations: RecordingRelation[];
    length: number;
    video: boolean;
    aliases: Alias[];
    tags: Tag[];
    genres: Genre[];
    'artist-credit': ArtistCredit[];
}


export interface LabelClass {
    name: string;
    'type-id': null | string;
    type: null | string;
    'sort-name': string;
    id: string;
    disambiguation: string;
    'label-code'?: null;
}

export interface RecordingRelation {
    'attribute-ids': {
        [arg: string]: string;
    };
    end: null | string;
    'target-type': string;
    ended: boolean;
    artist?: LabelClass;
    begin: null | string;
    'attribute-values': AttributeValues;
    'source-credit': string;
    'target-credit': string;
    attributes: string[];
    'type-id': string;
    type: string;
    direction: string;
    'attribute-credits'?: AttributeCredits;
    label?: LabelClass;
    work?: Work;
    recording?: Recording;
}

export interface AttributeCredits {
    'Rhodes piano'?: string;
    synthesizer?: string;
    'drums (drum set)'?: string;
    'Hammond organ'?: string;
    handclaps?: string;
    keyboard?: string;
    'drum machine'?: string;
    'foot stomps'?: string;
    'Wurlitzer electric piano'?: string;
}

export interface AttributeValues {
    task?: string;
}

export interface Recording {
    video: boolean;
    isrcs: any[];
    length: number;
    id: string;
    disambiguation: string;
    title: string;
    'artist-credit': ArtistCredit[];
}

export interface Work {
    title: string;
    type: string;
    'type-id': string;
    attributes: any[];
    language: string;
    iswcs: any[];
    id: string;
    relations: WorkRelation[];
    disambiguation: string;
    languages: string[];
}

export interface WorkRelation {
    direction: string;
    'target-credit': string;
    'type-id': string;
    attributes: any[];
    type: string;
    'attribute-values': Attribute;
    'source-credit': string;
    artist?: LabelClass;
    begin: null;
    ended: boolean;
    end: null;
    'target-type': string;
    'attribute-ids': Attribute;
    label?: LabelClass;
    url?: Url;
}

export interface Attribute {
    [arg: string]: any;
}

export interface Url {
    resource: string;
    id: string;
}

export interface ReleaseEvent {
    date: Date;
    area: null;
}

export interface ReleaseGroup {
    'primary-type': string;
    tags: Tag[];
    'artist-credit': ArtistCredit[];
    genres: Genre[];
    'secondary-type-ids': any[];
    aliases: any[];
    'primary-type-id': string;
    'first-release-date': Date;
    title: string;
    'secondary-types': any[];
    id: string;
    disambiguation: string;
}

export interface TextRepresentation {
    script: string;
    language: string;
}


export interface ReleaseAppend extends Release {
    aliases: any[];
    annotation: string;
    'artist-credit': ArtistCredit[];
    collections: Collection[];
    genres: Genre[];
    'label-info': LabelInfo[];
    media: Media[];
    relations: WorkRelation[];
    'release-group': ReleaseGroup;
    tags: any[];
}

export type ReleaseWithAppends<T extends keyof ReleaseAppend> = Release & Pick<ReleaseAppend, T>;

export const releaseAppend = [
	'aliases',
	'annotation',
	'artist-credit',
	'collections',
	'genres',
	'label-info',
	'media',
	'relations',
	'release-group',
	'tags',
	'genres',
] as const;

export const release = async (id: string) => {
	logger.log({
		level: 'info',
		name: 'musicBrainz',
		color: 'blue',
		message: `Fetching Release id: ${id}`,
	});

	const params = {
		params: {
			inc: [
				'artists',
				'labels',
				'recordings',
				'release-groups',
				'media',
				'artist-credits',
				'discids',
				'puids',
				'isrcs',
				'artist-rels',
				'label-rels',
				'recording-rels',
				'release-rels',
				'release-group-rels',
				'url-rels',
				'work-rels',
				'recording-level-rels',
				'work-level-rels',
				'annotation',
				'aliases',
				'artist-credits',
				'collections',
				'genres',
				'tags',
			].join('+'),
		},
	};

	const response = await mbApiClient.get<ReleaseWithAppends<typeof releaseAppend[number]>>(`release/${id}`, params);

	return response.data;
};

export const releaseCover = async (id) => {
	const response = await axios.get<Covers>(`https://coverartarchive.org/release/${id}`);

	return response.data.images;
};
