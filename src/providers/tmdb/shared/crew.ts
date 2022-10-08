import { Department } from './department';
import { Job } from './job';

export interface Crew {
	adult: boolean;
	gender: number | null;
	id: number;
	known_for_department: Department;
	name: string;
	original_name: string;
	popularity: number;
	profile_path: string | null;
	job: Job;
	credit_id: string;
	department: Department;
	total_episode_count: number;
}
