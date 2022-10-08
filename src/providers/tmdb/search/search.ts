export interface Search {
	adult?: boolean;
	backdrop_path: string;
	first_air_date?: string;
	genre_ids: number[];
	id: number;
	name: string;
	origin_country: string[];
	original_language: string;
	original_name: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string;
	release_date?: string;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
}
