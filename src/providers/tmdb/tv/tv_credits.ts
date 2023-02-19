import { Cast, Crew } from '../shared';

export interface TvCredits {
	cast: Cast[];
	crew: Crew[];
	id: number;
}

export interface TvCast {
	credit_id: string;
	original_name: string;
	id: number;
	genre_ids: number[];
	character: string;
	name: string;
	poster_path: string | null;
	vote_count: number;
	vote_average: number;
	popularity: number;
	episode_count: number;
	original_language: string;
	first_air_date: string;
	backdrop_path: string | null;
	overview: string;
	origin_country: string[];
}

export interface TvCrew {
	id: number;
	department: string;
	original_language: string;
	episode_count: number;
	job: string;
	overview: string;
	origin_country: string[];
	original_name: string;
	genre_ids: number[];
	name: string;
	first_air_date: string;
	backdrop_path: string | null;
	popularity: number;
	vote_count: number;
	vote_average: number;
	poster_path: string | null;
	credit_id: string;
}
