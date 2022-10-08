import { Episode } from '../episode/episode';
import { Credits } from '../season/season-credits';
import { ExternalIDS } from '../season/external_ids';
import { SeasonImages } from '../season/images';

import { Season } from './season';
import { SeasonTranslations } from './translations';

export interface SeasonDetails extends Season {
	_id: string;
	episodes: Episode[];
	name: string;
	overview: string;
}

export interface SeasonAppend extends SeasonDetails {
	aggregate_credits: Credits;
	external_ids: ExternalIDS;
	images: SeasonImages;
	translations: SeasonTranslations;
	credits: Credits;
}

export type SeasonWithAppends<T extends keyof SeasonAppend> = SeasonDetails & Pick<SeasonAppend, T>;
