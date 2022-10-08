export interface SeasonAccountStates {
	id: number;
	favorite: boolean;
	rated: Rated | boolean;
	watchlist: boolean;
}

interface Rated {
	value: boolean;
}
