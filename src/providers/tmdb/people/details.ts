import { Person } from './person';
import { PersonTranslations } from './translations';
import { Image } from '../shared/image';
import { ExternalIDS } from './external_ids';
import { PersonCredits } from './credits';
import { TvCredits } from '../tv';
import { MovieCredits } from '../movie';

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
