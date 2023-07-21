import { Genre } from '../shared/genre';
import { movieGenre } from '../movie';
import { tvGenre } from '../tv';
import { unique } from '@server/functions/stringArray';

export * from './movie_genre';
export * from './tv_genres';

export default async function genres(): Promise<Genre[]> {
	const data: Array<Genre> = [];

	await Promise.all([
		movieGenre().then(movie => data.push(...movie)),
		tvGenre().then(tv => data.push(...tv)),
	]);

	return unique(data, 'id');
}
