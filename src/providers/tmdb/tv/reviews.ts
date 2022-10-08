import { PaginatedResponse } from '../helpers';

export type TvReviews = PaginatedResponse<Review[]>;

export interface Review {
	author: string;
	author_details: Author;
	content: string;
	created_at: string;
	id: string;
	updated_at: string;
	url: string;
}

export interface Author {
	name: string;
	username: string;
	avatar_path: string | null;
	rating: number;
}
