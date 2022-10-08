import { TvShow } from '../tv';

export interface RatedTvShows {
	page: number;
	results: RatedResult;
	total_pages: number;
	total_results: number;
}

interface RatedResult extends TvShow {
	rating: number;
}
