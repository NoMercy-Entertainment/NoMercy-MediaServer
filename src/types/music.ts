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
    currentItem: Song;
    currentItemIndex: number;
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
    track?: number | null;
    disc?: number | null;
    cover: string | null;
    date?: string | null;
    folder: string;
    filename: string;
    duration: string;
    quality: number;
    path: string;
    colorPalette: ColorPalette;
    blurHash: string | null;
    Artist?: Artist[];
    Album?: Album[];
    type: string;
    favorite_track: boolean;
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
    colorPalette: ColorPalette | null;
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
    favoriteArtist: boolean;
    cover: string | null;
    folder: string;
    colorPalette: ColorPalette;
    blurHash: string | null;
    libraryId: string;
    trackId: null;
    Track: Song[];
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
	_count: any;
    id: string;
    libraryId: string;
    albumId?: string;
    artistId?: string;
    favoriteArtist: boolean;
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
    disc: string;
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
    favorite_track: any;
    type: string;
    artistId: string;
    Track: Song[];
    origin: string;
    artists: Artist[];
    path: string;
    libraryId: string;
    colorPalette: PaletteColors;
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
    track?: number | null;
    disc?: number | null;
    cover: string | null;
    date?: null | string;
    folder: string;
    filename: string;
    duration: string;
    quality: number;
    path: string;
    lyrics?: null | string;
    colorPalette: ColorPalette;
    blurHash: string | null;
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
    colorPalette: null | string;
    blurHash: null | string;
    libraryId: string;
    trackId: null;
}

export interface MusicGenre {
    id: string;
    name: string;
}
