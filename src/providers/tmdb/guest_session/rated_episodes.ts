import { Episode } from '../episode/episode';

export interface RatedEpisodes {
	page: number;
	results: RatedResult;
	total_pages: number;
	total_results: number;
}

interface RatedResult extends Episode {
	rating: number;
}
