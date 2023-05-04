import { Department } from './department';
import { Role } from './role';

export interface Cast {
	adult: boolean;
	gender: number | null;
	id: number;
	known_for_department: Department;
	name: string;
	original_name: string;
	popularity: number;
	profile_path: string | null;
	roles?: Role[];
	total_episode_count?: number;
	order?: number;
	credit_id: string;
	character: string;
	poster_path?: string | null;
}
