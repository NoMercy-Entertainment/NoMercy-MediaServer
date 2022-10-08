import { Movie } from '../movie';
import { Person } from '../people/person';
import { TvShow } from '../tv';

export interface Find {
	movie_results: Movie[];
	person_results: Person[];
	tv_results: TvShow[];
}
