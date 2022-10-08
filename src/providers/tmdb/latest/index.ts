import { MovieDetails, movieLatest } from '../movie';
import { TvDetails, tvLatest } from '../tv';

const latest = async () => {

	const data: Array<TvDetails | MovieDetails> = [];

	await Promise.all([
		movieLatest().then(movie => data.push(movie)),
		tvLatest().then(tv => data.push(tv))
	]);

	return data;
};

export default latest;
