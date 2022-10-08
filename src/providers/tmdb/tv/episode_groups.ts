import { Network } from '../networks/network';

export interface TvEpisodeGroups {
	results: EpisodeGroup[];
	id: number;
}

export interface EpisodeGroup {
	description: string;
	episode_count: number;
	group_count: number;
	id: string;
	name: string;
	network: null | Network;
	type: number;
}
