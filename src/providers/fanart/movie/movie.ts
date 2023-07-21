import { Image } from '../shared/image';
import { MovieDisc } from './disc';

export interface Movie {
    name: string;
    tmdb_id: string;
    imdb_id: string;
    hdmovielogo: Image[];
    moviedisc: MovieDisc[];
    movielogo: Image[];
    movieposter: Image[];
    hdmovieclearart: Image[];
    movieart: Image[];
    moviebackground: Image[];
    moviebanner: Image[];
    moviethumb: Image[];
}
