export interface Person {
	adult: boolean;
	also_known_as: string[];
	biography: string;
	gender: number;
	id: number;
	imdb_id: string;
	known_for_department: string;
	name: string;
	place_of_birth: string;
	popularity: number;
	profile_path: string;
	media_type?: string | null;
}
