export interface MovieChanges {
	changes: MovieChange[];
}

export interface MovieChange {
	key: string;
	items: MovieChangeItem[];
}

export interface MovieChangeItem {
	id: string;
	action: string;
	time: string;
	iso_3166_1: string;
	value: string;
	original_value: string;
}
