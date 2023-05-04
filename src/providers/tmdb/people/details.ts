import { ExternalIDS } from './external_ids';
import { Image } from '../shared/image';
import { MovieCredits } from '../movie';
import { Person } from './person';
import { PersonCredits } from './credits';
import { PersonTranslations } from './translations';
import { TvCredits } from '../tv';

export interface PersonDetails extends Person {
	also_known_as: string[];
	biography: string;
	birthday: string;
	deathday: string;
	gender: number;
	homepage: string;
	imdb_id: string;
	place_of_birth: string;
}

export interface PersonAppend extends PersonDetails {
	details: PersonDetails;
	credits: PersonCredits;
	combined_credits: MovieCredits | TvCredits;
	movie_credits: MovieCredits;
	tv_credits: TvCredits;
	external_ids: ExternalIDS;
	images: ProfileImages;
	translations: PersonTranslations;
}

export interface ProfileImages {
	profiles: Image[];
}

export type PersonWithAppends<T extends keyof PersonAppend> = PersonDetails & Pick<PersonAppend, T>;
