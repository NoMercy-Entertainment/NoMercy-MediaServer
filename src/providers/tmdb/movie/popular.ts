import { Movie } from './movie';

export interface MoviePopular {
	page: number;
	results: Movie[];
	total_pages: number;
	total_results: number;
}
