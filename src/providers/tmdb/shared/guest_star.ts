import { Department } from './department';

export interface GuestStar {
	character: string;
	credit_id: string;
	order: number;
	adult: boolean;
	gender: number | null;
	id: number;
	known_for_department: Department;
	name: string;
	original_name: string;
	popularity: number;
	profile_path: string | null;
}
