export interface Covers {
    images:  Image[];
    release: string;
}

export interface Image {
    approved:   boolean;
    back:       boolean;
    comment:    string;
    edit:       number;
    front:      boolean;
    id:         number;
    image:      string;
    thumbnails: Thumbnails;
    types:      CoverType[];
}

export interface Thumbnails {
    "250":  string;
    "500":  string;
    "1200": string;
    large:  string;
    small:  string;
}

export enum CoverType{
    'Matrix/Runout',
    'Raw/Unedited',
    Back,
    BackSpine ,
    Booklet,
    Bottom,
    Front,
    Liner,
    Medium,
    Obi,
    Other,
    Poster,
    Spine,
    Sticker,
    Top,
    Track,
    Tray,
    Watermark
}