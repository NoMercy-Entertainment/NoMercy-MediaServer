
export interface CDNInfoResponse {
    status: string;
    data:   Data;
}

export interface Data {
    state:     string;
    version:   string;
    copyright: string;
    licence:   string;
    contact:   Contact;
    git:       string;
    keys:      Keys;
    quote:     string;
    colors:    string[];
    downloads: {
        [platform: string]: Files[];
    };
}

export interface Contact {
    homepage:  string;
    email:     string;
    dmca:      string;
    languages: string;
}

export interface Downloads {
    [platform: string]: Files[];
}

export interface Files {
    name:    string;
    path:    string;
    url:     string;
    filter?: string;
    url2?:   string;
}

export interface Keys {
    makemkv_key: string;
    tmdb_key:    string;
}
