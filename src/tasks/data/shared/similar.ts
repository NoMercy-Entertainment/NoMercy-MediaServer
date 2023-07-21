import { CompleteMovieAggregate } from '../movie/fetchMovie';
import { CompleteTvAggregate } from '../tv/fetchTvShow';
import { Movie } from '@server/providers/tmdb/movie/index';
import { TvShow } from '@server/providers/tmdb/tv/index';
import colorPalette from '@server/functions/colorPalette/colorPalette';
// import createBlurHash from '@server/functions/createBlurHash';
import { createTitleSort } from '@server/tasks/files/filenameParser';
import { unique } from '@server/functions/stringArray';
import { insertSimilar } from '@server/db/media/actions/similars';
import { getMoviesDB } from '@server/db/media/actions/movies';
import Logger from '@server/functions/logger/logger';
import { selectTvsDB } from '@server/db/media/actions/tvs';

export default async (req: CompleteTvAggregate | CompleteMovieAggregate, transaction: any[], type: 'movie' | 'tv') => {

	const movies = getMoviesDB().map(m => m.id);
	const tvs = selectTvsDB().map(m => m.id);

	for (const similar of unique<Movie | TvShow>(req.similar.results, 'id')) {

		const palette: any = {
			poster: undefined,
			backdrop: undefined,
		};

		const blurHash: any = {
			poster: undefined,
			backdrop: undefined,
		};

		await Promise.all([
			// similar.poster_path && createBlurHash(`https://image.tmdb.org/t/p/w185${similar.poster_path}`).then((hash) => {
			// 	blurHash.poster = hash;
			// }),
			// similar.backdrop_path && createBlurHash(`https://image.tmdb.org/t/p/w185${similar.backdrop_path}`).then((hash) => {
			// 	blurHash.backdrop = hash;
			// }),
			similar.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${similar.poster_path}`).then((hash) => {
				palette.poster = hash;
			}),
			similar.backdrop_path && colorPalette(`https://image.tmdb.org/t/p/w185${similar.backdrop_path}`).then((hash) => {
				palette.backdrop = hash;
			}),
		]);

		try {
			insertSimilar({
				backdrop: similar.backdrop_path,
				media_id: similar.id,
				overview: similar.overview,
				poster: similar.poster_path,
				title: (similar as TvShow).name ?? (similar as Movie).title,
				titleSort: createTitleSort((similar as TvShow).name ?? (similar as Movie).title),
				blurHash: JSON.stringify(blurHash),
				colorPalette: JSON.stringify(palette),
				movieFrom_id: type === 'movie'
					? req.id
					: undefined,
				movieTo_id: type === 'movie' && movies.includes(similar.id)
					? similar.id
					: undefined,
				tvFrom_id: type === 'tv'
					? req.id
					: undefined,
				tvTo_id: type === 'tv' && tvs.includes(similar.id)
					? similar.id
					: undefined,
			}, type);
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['similar', error]),
			});
		}
	}
};
