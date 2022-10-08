import { Translation } from '../shared/translation';

export interface TvShowTranslations {
	id: number;
	translations: TvShowTranslation[];
}

export interface TvShowTranslation extends Translation {
	data: {
		name: string;
		overview: string;
		homepage: string;
	};
}
