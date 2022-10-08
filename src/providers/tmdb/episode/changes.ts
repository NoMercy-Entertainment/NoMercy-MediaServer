export interface EpisodeChanges {
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
	value: string;
	iso_639_1: string;
}
