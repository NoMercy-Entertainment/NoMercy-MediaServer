import { Episode } from '../episode/episode';
import { Network } from '../networks/network';

export interface EpisodeGroups {
	description: string;
	episode_count: number;
	group_count: number;
	groups: Group[];
	id: string;
	name: string;
	network: Network;
	type: GroupEnum;
}

export enum GroupEnum {
	'Original air date',
	'Absolute',
	'DVD',
	'Digital',
	'Story arc',
	'Production',
	'TV',
}

export interface Group {
	id: string;
	name: string;
	order: number;
	episodes: Episode;
	locked: boolean;
}
