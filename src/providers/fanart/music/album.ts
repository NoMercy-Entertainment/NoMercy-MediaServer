import { Release } from './shared';

export interface AlbumImage {
    name: string;
    mbid_id: string;
    albums: Albums;
}

export interface Albums {
    [arg: string]: Release;
}
