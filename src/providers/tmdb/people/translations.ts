import { Translation } from '../shared/translation';

export interface PersonTranslations {
	translations: PersonTranslation[];
	id: number;
}

interface PersonTranslation extends Translation {
	data: {
		name: string;
		homepage: string;
		biography: string;
	};
}
