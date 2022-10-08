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
	registerPlugin: typeof videojs.Plugin.registerPlugin;
	plugin: typeof videojs.Plugin.registerPlugin;
	browser: videojs.Browser;
}

interface AudioTracks extends videojs.AudioTrackList {
	tracks_: AudioTrack[];
}
interface AudioTrack extends videojs.VideojsAudioTrack {
	enabled: boolean;
}

interface TextTracks extends videojs.TextTrackList {
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
