import { TvShow } from '../tv';

export interface OnTheAir {
	page: number;
	results: TvShow[];
	total_pages: number;
	total_results: number;
}
