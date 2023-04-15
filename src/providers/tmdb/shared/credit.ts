import { Department } from './department';
import { Episode } from '../episode/episode';
import { Season } from '../season/season';

export interface Credit {
	credit_type: CreditType;
	department: Department;
	job: string;
	media: {
		id: number;
		original_name: string;
		name: string;
		character: string;
		episodes: Episode[];
		seasons: Season[];
	};
	media_type: MediaType;
	id: string;
	person: {
		name: string;
		id: number;
	};
}

export enum MediaType {
	anime = 'anime',
	movie = 'movie',
	tv = 'tv',
	collection = 'collection',
	special = 'special',
	music = 'music',
}

export enum CreditType {
	cast = 'cast',
	crew = 'crew',
	guest_star = 'guest_star',
}

export interface AggregateCredit {
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: null | string;
    total_episode_count: number;
    order?: number;
    jobs?: CreditJob[];
    roles?: CreditRole[];
    department?: string;
}

export interface AggregateCredits {
    cast: AggregateCredit[];
    crew: AggregateCredit[];
}

export interface CreditJob {
    credit_id: string;
    job: string;
    episode_count: number;
}

export interface CreditRole {
    credit_id: string;
    character: string;
    episode_count: number;
}
