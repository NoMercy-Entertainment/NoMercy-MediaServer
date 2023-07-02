import { AlbumCover } from './shared';

export interface ArtistImage {
    name: string;
    mbid_id: string;
    albums: string;
    artistbackground: AlbumCover[];
    artistthumb: AlbumCover[];
    musiclogo: AlbumCover[];
    hdmusiclogo: AlbumCover[];
    musicbanner: AlbumCover[];
}
