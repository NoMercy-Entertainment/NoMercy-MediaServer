import { Translation } from '../shared/translation';

export interface MovieTranslations {
	id: number;
	translations: MovieTranslation[];
}

export interface MovieTranslation extends Translation {
	data: {
		title: string;
		overview: string;
		homepage: string;
	};
}
