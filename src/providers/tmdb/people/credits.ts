import { MovieCast, MovieCrew } from '../movie';
import { TvCast, TvCrew } from '../tv';

export interface PersonCast extends MovieCast, TvCast {}
export interface PersonCrew extends MovieCrew, TvCrew {}

export interface PersonCredits {
	cast: Array<PersonCast>;
	crew: Array<PersonCrew>;
	id: number;
}
