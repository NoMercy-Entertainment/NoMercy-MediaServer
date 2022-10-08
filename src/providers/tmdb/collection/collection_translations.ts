import { Translation } from '../shared/translation';

export interface CollectionTranslations {
	id: number;
	translations: CollectionTranslation[];
}

interface CollectionTranslation extends Translation {
	data: {
		name: string;
		overview: string;
		homepage: string;
	};
}
