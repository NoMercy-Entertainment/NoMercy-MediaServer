import { MovieCast, MovieCrew } from '../movie';
import { TvCast, TvCrew } from '../tv';

export interface PersonCast extends MovieCast, TvCast {
	media_type: string;
}
export interface PersonCrew extends MovieCrew, TvCrew {
	media_type: string;
}

export interface PersonCredits {
	cast: Array<PersonCast>;
	crew: Array<PersonCrew>;
	id: number;
}
