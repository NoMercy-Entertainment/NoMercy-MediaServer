import { Movie } from '../movie';

export interface RatedMovies {
	page: number;
	results: RatedResult;
	total_pages: number;
	total_results: number;
}

interface RatedResult extends Movie {
	rating: number;
}
