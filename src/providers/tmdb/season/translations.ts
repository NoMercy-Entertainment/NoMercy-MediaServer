import { Translation } from '../shared/translation';

export interface SeasonTranslations {
	id: number;
	translations: SeasonTranslation[];
}

interface SeasonTranslation extends Translation {
	data: {
		name: string;
		overview: string;
	};
}
