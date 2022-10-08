export interface Reviews {
	page: number;
	results: Review[];
	total_pages: number;
	total_results: number;
}

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
