import { Cast } from '../shared/cast';
import { Crew } from '../shared/crew';

export interface TvAggregateCredits {
	cast: Cast[];
	crew: Crew[];
	id: number;
}
