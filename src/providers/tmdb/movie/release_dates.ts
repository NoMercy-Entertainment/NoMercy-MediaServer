export interface MovieReleaseDates {
	results: {
		iso_3166_1: string;
		release_dates: ReleaseDate[];
	}[];
}

export interface ReleaseDate {
	certification: string;
	iso_639_1: string;
	release_date: string;
	type: number;
	note: string;
}
