import { Cast } from '../shared/cast';
import { Crew } from '../shared/crew';

export interface AggregateCredits {
	cast: Cast[];
	crew: Crew[];
	id: number;
}
