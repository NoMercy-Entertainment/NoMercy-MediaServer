
export interface Albums {
    [arg: string]: Release;
}

export interface Release {
    albumcover?: AlbumCover[];
    cdart?: Cdart[];
}

export interface AlbumCover {
    id: string;
    url: string;
    likes: string;
}

export interface Cdart {
    id: string;
    url: string;
    likes: string;
    disc: string;
    size: string;
}
