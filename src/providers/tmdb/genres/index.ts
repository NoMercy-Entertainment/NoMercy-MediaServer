import { movieGenre } from '../movie';
import { unique } from '../../../functions/stringArray';
import { Genre } from '../shared/genre';
import { tvGenre } from '../tv';

export * from './movie_genre';
export * from './tv_genres';

export default async function genres(): Promise<Genre[]> {
	const data: Array<Genre> = [];

	await Promise.all([
		movieGenre().then(movie => data.push(...movie)),
		tvGenre().then(tv => data.push(...tv))
	]);

	return unique(data, 'id');
}
