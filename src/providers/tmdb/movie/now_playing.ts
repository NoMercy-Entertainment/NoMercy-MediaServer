import { Movie } from './movie';

export interface Dates {
	maximum: string;
	minimum: string;
}

export interface MoviesNowPlaying {
	dates: Dates;
	page: number;
	results: Movie[];
	total_pages: number;
	total_results: number;
}
