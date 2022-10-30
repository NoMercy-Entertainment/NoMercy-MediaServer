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
  state: State
  playState: PlayState
  mutedState: MutedState
  volumeState: number
  positionState: number
  durationState: number
  currentPlaylist: ListItem
  displayList: ListItem
  currentItem: Song
  lyrics: string | null
  showLyrics: boolean
  currentDevice: string | null

  artists: Artist[]
  albums: Album[]
  playlists: ListItem[]
  likedSongs: ListItem[]
}

export enum MusicType {
  artist = 'artist',
  album = 'album',
  playlist = 'playlist',
  search = 'search',
}

export interface ListItem {
  id: string
  name: string
  description: null
  artistId: string
  albumId: string
  cover: string
  folder: string
  year?: number
  track?: Song[]
  artist?: Artist[]
  type?: MusicType
}

export interface Song {
  id: string
  name: string
  track: number
  disc: string
  cover: string
  date: string
  share: string
  folder: string
  filename: string
  duration: string
  quality: number
  host_folder: string
  lyrics: string
  artist: Artist
  album: Album
  favorite_track: any
  type: string
  artistId: string
  origin: string
  artists: Artist[]
  src?: string
}
export interface Album {
  id: string
  name: string
  albumId: string
  cover: string
  description: string
  year: number
  share: string
  origin: string
}
export interface Artist {
  id: string
  name: string
  artistId: string | number
  cover: string
  description: string | null
  folder: string
  share: string
  origin: string
}
