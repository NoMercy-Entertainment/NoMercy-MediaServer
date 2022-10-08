import { EpisodeChanges } from '../episode/changes';
import { Crew, GuestStar } from '../shared';
import { ExternalIDS } from './external_ids';
import { Credits } from './episode-credits';
import { Episode } from './episode';
import { EpisodeImages } from './images';
import { EpisodeTranslations } from './translations';
import { Videos } from './videos';

export interface EpisodeDetails extends Episode {
	crew: Crew[];
	guest_stars: GuestStar[];
	id: number;
}

export interface EpisodeAppend extends EpisodeDetails {
	credits: Credits;
	external_ids: ExternalIDS;
	images: EpisodeImages;
	changes: EpisodeChanges;
	translations: EpisodeTranslations;
}

export type EpisodeWithAppends<T extends keyof EpisodeAppend> = EpisodeDetails & Pick<EpisodeAppend, T>;
