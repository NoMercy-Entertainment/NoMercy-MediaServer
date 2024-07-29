import { PaletteColors } from './server';

/* eslint-disable linebreak-style */
export enum State {
	idle = 'idle',
	loading = 'loading',
	ready = 'ready',
	error = 'error',
}

export enum PlayState {
	paused = 'paused',
	playing = 'playing',
}

export enum MutedState {
	unmuted = 'unmuted',
	muted = 'muted',
}

export interface Music {
	playlists: any[];
	audio: HTMLAudioElement;
	backLog: Song[];
	currentSong: Song;
	currentSongIndex: number;
	crossfadeSteps: number;
	displayList: DisplayList;
	filteredList: Song[];
	durationState: number;
	fadeDuration: number;
	isCurrentDevice: boolean;
	lyrics: string;
	sortType: string;
	sortOrder: string;
	mutedState: string;
	playState: string;
	positionState: number;
	queue: Song[];
	showLyrics: boolean;
	shuffle: boolean;
	repeat: boolean;
	state: string;
	volumeState: number;
}

export interface Item {
	id: string;
	name: string;
	track?: number | null | undefined | null;
	disc?: number | null | undefined | null;
	cover: string | null;
	date?: string | null;
	folder: string;
	filename: string;
	duration: string;
	quality: number;
	path: string;
	color_palette;
	ColorPalette;
	Artist?: Artist[];
	Album?: Album[];
	type: string;
	favorite_track: boolean;
	favorite_album: boolean;
	favorite_artist: boolean;
	origin: string;
	libraryId: string;
}

export interface Album {
	id: string;
	name: string;
	folder: string;
	cover: string | null;
	description?: string | null;
	libraryId: string;
	origin: string;
	color_palette: ColorPalette | null;
}

export interface ColorPalette {
	primary: string;
	lightVibrant: string;
	darkVibrant: string;
	lightMuted: string;
	darkMuted: string;
}

export interface DisplayList {
	id: string;
	name: string;
	description?: string | null;
	favorite_artist: boolean;
	cover: string | null;
	folder: string;
	color_palette;
	ColorPalette;
	libraryId: string;
	trackId: null;
	Track: Song[];
	Artist: Artist[];
	_count: Count;
	type: string;
}

export interface Count {
	Album?: number;
	Artist?: number;
	Track?: number;
}


export enum MusicType {
	artist = 'artist',
	album = 'album',
	playlist = 'playlist',
	search = 'search',
	genre = 'genre',
}

export interface ListItem {
	_count: Count;
	id: string;
	libraryId: string;
	albumId?: string;
	artistId?: string;
	favorite_artist: boolean;
	name: string;
	description?: string | null;
	cover: string | null;
	folder: string;
	year?: number;
	Track?: Song[];
	Artist?: Artist[];
	type?: MusicType;
}

export interface Song {
	id: string;
	name: string;
	track: number | null;
	disc: number | null;
	cover: string | null;
	date: string;
	share: string;
	folder: string;
	filename: string;
	duration: string;
	quality: number;
	host_folder: string;
	lyrics: string;
	Artist?: Artist[];
	Album?: Album[];
	favorite_track: boolean;
	favorite_album: boolean;
	favorite_artist: boolean;
	type: string;
	artistId: string;
	Track: Song[];
	origin: string;
	artists: Artist[];
	path: string;
	libraryId: string;
	color_palette;
	PaletteColors;
	artist_track: Artist[];
	album_track: Album[];
}

export interface Album {
	id: string;
	name: string;
	albumId: string;
	cover: string | null;
	description?: string | null;
	year: number;
	share: string;
	origin: string;
}

export interface Artist {
	id: string;
	name: string;
	artistId: string | number;
	cover: string | null;
	description?: string | null;
	folder: string;
	share: string;
	origin: string;
}

export interface HomeData {
	title: string;
	moreLink: string;
	items: Item[];
}

export interface Item {
	id: string;
	name: string;
	track?: number | null | undefined;
	disc?: number | null | undefined;
	cover: null | string;
	date?: null | string;
	folder: string;
	filename: string;
	duration: string;
	quality: number;
	path: string;
	lyrics?: null | string;
	color_palette;
	ColorPalette;
	MusicGenre?: MusicGenre[];
	libraryId: string;
	type: string;
	description?: string | null;
	trackId?: null;
	title_sort?: string;
	origin: string;
	country?: string;
	year?: number;
	tracks?: number;
	Artist?: Artist[];
}

export interface Artist {
	id: string;
	name: string;
	description?: string | null;
	cover: string | null;
	folder: string;
	color_palette: null | string;
	libraryId: string;
	trackId: null;
}

export interface MusicGenre {
	id: string;
	name: string;
}

export interface Playlist {
	color_palette: any;
	track: Song[];
	id: string;
	userId: string;
	name: string;
	description: string | null;
	cover: string | null;
	created_at: Date;
	updated_at: Date;
}

export interface PlaylistResponse {
	type: string;
	data: Playlist[];
}

export interface Lyric {
	text: string;
	time: Time;
}

export interface Time {
	total: number;
	minutes: number;
	seconds: number;
	hundredths: number;
}


export interface MusicCardPageResponse {
	type: string;
	data: MusicCardPageResponseData[];
}

export interface MusicCardPageResponseData {
	id: string;
	name: string;
	description: null;
	folder: string;
	cover: null | string;
	country: null | string;
	year: number | null;
	tracks: number;
	color_palette: PaletteColors;
	libraryId: string;
	Artist: Artist[];
	_count: Count;
	type: string;
	titleSort: string;
	origin: string;
}

export interface Artist {
	id: string;
	name: string;
	description?: string | null;
	cover: null | string;
	folder: string;
	color_palette: null | string;
	libraryId: string;
	trackId: null;
}
