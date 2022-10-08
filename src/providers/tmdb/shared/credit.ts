import { Episode } from '../episode/episode';
import { Season } from '../season/season';
import { Department } from './department';

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
