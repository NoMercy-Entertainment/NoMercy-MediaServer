export interface PeopleChanges {
	changes: Changes[];
}

interface Changes {
	key: string;
	items: Change[];
}

interface Change {
	id: string;
	action: string;
	time: string;
	original_value: {
		profile: {
			file_path: string;
		};
	};
}
