import { Translation } from '../shared/translation';

export interface EpisodeTranslations {
	id: number;
	translations: EpisodeTranslation[];
}

interface EpisodeTranslation extends Translation {
	data: {
		name: string;
		overview: string;
	};
}
