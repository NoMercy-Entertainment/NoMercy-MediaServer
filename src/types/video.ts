import videojs from 'video.js';
import { sortByPriorityKeyed } from '../functions/stringArray';

// @ts-ignore
export interface VideoPlayer extends videojs.Player {
	audioTracks: () => AudioTracks;
	textTracks: () => TextTracks;
	qualityLevels: () => QualityLevels;
	playlist: (() => any) | any;
	nomercy: (() => any) | any;
	tech_: any;
	firstPlay: boolean;
	audio: () => any;
	text: () => any;
	quality: () => any;
	sortByPriorityKeyed: typeof sortByPriorityKeyed;
	localize: (arg0: string) => string | null;
	loadingSpinner: {
		el_: {
			id: string;
			innerHTML: string;
			classList: any;
			style: {
				backgroundClip: string;
				border: string;
				borderRadius: string;
				boxSizing: string;
				display: string;
				height: string;
				left: string;
				margin: string;
				opacity: string;
				position: string;
				textAlign: string;
				top: string;
				transform: string;
				visibility: string;
				width: string;
			};
			append: (arg0: HTMLDivElement) => void;
		};
	};
	lock: boolean;
	overlay: HTMLDivElement;
	Vhs: any;
	on: (event: string, callback: (arg0: any, arg1: unknown) => any) => void;
	registerPlugin: typeof videojs.registerPlugin;
	plugin: typeof videojs.registerPlugin;
	browser: typeof videojs.dom;
}

interface AudioTracks extends videojs.AudioTrack {
	tracks_: AudioTrack[];
}
interface AudioTrack extends videojs.AudioTrack {
	enabled: boolean;
}

interface TextTracks extends videojs.TextTrack {
	tracks_: TextTrack[];
}
interface TextTrack extends videojs.TextTrack {
	enabled: boolean;
}

interface QualityLevels {
	levels_: QualityLevel[];
	selectedIndex: number;
}
interface QualityLevel {
	enabled: boolean;
	id: string;
	width: number;
	label: string;
	height: number;
	bitrate: number;
	selectedIndex: number;
}


export interface PlaylistItem {
    id: number;
	special_id?: string;
    title: string | null;
    description: string | null;
    duration: string | null | undefined;
    poster: string | null;
    image: string | null;
    year: number | null;
    video_type: string;
    production?: boolean;
    season?: number;
    episode?: number;
    episode_id?: number;
    origin: string;
    uuid: number;
    video_id: string | null;
    tmdbid: number;
    show: string | null | undefined;
    seasonName?: string | null;
    playlist_type: string;
    logo: string | null;
	rating: {
		id: number;
		rating: string;
		iso31661: string;
		meaning: string;
		order: number;
	} | undefined
    progress: { percentage: number; date: string; } | null;

    textTracks: any[];
    sources: {
        src: string;
        type: string;
        languages: any;
    }[];
    tracks: {
        file: string;
        kind: string;
    }[];

	fontsFile?: string;
	fonts?: {
		file: string;
		type: string;
	}[]
}
