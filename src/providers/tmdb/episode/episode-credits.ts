import { Cast, Crew, GuestStar } from '../shared';

export interface Credits {
	cast: Cast[];
	crew: Crew[];
	guest_stars: GuestStar[];
	id?: number;
}
