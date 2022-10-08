export interface TvScreenedTheatrically {
	id: number;
	result: Episodes[];
}

interface Episodes {
	id: number;
	episode_number: number;
	season_number: number;
}
