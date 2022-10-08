import { Company } from '../company/company';
import { Episode } from '../episode/episode';
import { Network } from '../networks/network';
import { Season } from '../season/season';
import { Country, CreatedBy, Genre, SpokenLanguage, Similar } from '../shared';
import { ExternalIDS } from './external_ids';
import { Recommendations } from './recommendations';
import { TvShowTranslations } from './translations';
import { TvShow } from './tv';
import { AlternativeTitles } from './alternative_title';
import { TvKeywords } from './keywords';
import { TvImages } from './images';
import { TvVideos } from './videos';
import { TvWatchProviders } from './watch_providers';
import { TvCredits } from './tv_credits';
import { TvContentRatings } from './content_ratings';

export interface TvDetails extends TvShow {
	adult?: boolean;
	media_type: string;
	created_by: CreatedBy[];
	episode_run_time: number[];
	genres: Genre[];
	homepage: string;
	in_production: boolean;
	languages: string[];
	last_air_date: string;
	last_episode_to_air: Episode;
	next_episode_to_air: Episode | null;
	networks: Network[];
	number_of_episodes: number;
	number_of_seasons: number;
	production_companies: Company[];
	production_countries: Country[];
	seasons: Season[];
	spoken_languages: SpokenLanguage[];
	status: string;
	tagline: string;
	type: string;
}

export interface TvAppend extends TvDetails {
	aggregate_credits: TvCredits;
	alternative_titles: AlternativeTitles;
	content_ratings: TvContentRatings;
	credits: TvCredits;
	external_ids: ExternalIDS;
	images: TvImages;
	keywords: TvKeywords;
	recommendations: Recommendations;
	similar: Similar<TvShow>;
	translations: TvShowTranslations;
	videos: TvVideos;
	'watch/providers': TvWatchProviders;
}

export type TvWithAppends<T extends keyof TvAppend> = TvDetails & Pick<TvAppend, T>;
