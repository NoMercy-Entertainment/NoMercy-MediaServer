export interface SeasonChanges {
	changes: Changes[];
}

export interface Changes {
	key: string;
	items: Change[];
}

interface Change {
	id: string;
	action: string;
	time: string;
	value: {
		episode_id: number;
		episode_number: number;
	};
	iso_639_1: string;
}
