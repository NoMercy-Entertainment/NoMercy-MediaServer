import { Episode } from '../episode/episode';
import { Season } from '../season/season';

export interface Media {
	original_name: string;
	origin_country: string;
	name: string;
	vote_count: number;
	backdrop_path: string | null;
	vote_average: number;
	genre_ids: number[];
	first_air_date: string;
	id: number;
	overview: string | null;
	poster_path: string | null;
	original_language: string;
	popularity: number;
	character: string;
	episodes: Episode[];
	seasons: Season[];
}
