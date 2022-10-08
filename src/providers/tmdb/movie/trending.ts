import { Movie } from './movie';

export interface TrendingMovies {
	page: number;
	results: Movie[];
	total_pages: number;
	total_results: number;
}
