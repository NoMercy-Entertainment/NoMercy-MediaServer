import { Video } from '../shared/video';

export interface Movie {
	id: number;
	title: string;
	original_title: string;
	poster_path: string | null;
	adult: boolean;
	overview: string;
	release_date: string;
	genre_ids: number[] | undefined;
	original_language: string;
	backdrop_path: string | null;
	popularity: number;
	tagline?: string;
	vote_count: number;
	video: Video | boolean;
	vote_average: number;
	media_type: string;
}
