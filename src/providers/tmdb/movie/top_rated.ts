import { Movie } from './movie';

export interface MovieTopRated {
	page: number;
	results: Movie[];
	total_pages: number;
	total_results: number;
}
