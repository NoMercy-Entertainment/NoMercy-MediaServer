
export interface LabelImage {
    name: string;
    id: string;
    musiclabel: Musiclabel[];
}

export interface Musiclabel {
    id: string;
    url: string;
    colour: string;
    likes: string;
}
