import { CompleteMovieAggregate } from '../movie/fetchMovie';
import { CompleteTvAggregate } from '../tv/fetchTvShow';
import { Movie } from '@server/providers/tmdb/movie/index';
import { TvShow } from '@server/providers/tmdb/tv/index';
import colorPalette from '@server/functions/colorPalette/colorPalette';
// import createBlurHash from '@server/functions/createBlurHash';
import { createTitleSort } from '@server/tasks/files/filenameParser';
import { insertRecommendation } from '@server/db/media/actions/recommendations';
import { getMoviesDB } from '@server/db/media/actions/movies';
import Logger from '@server/functions/logger/logger';
import { selectTvsDB } from '@server/db/media/actions/tvs';
import { parseYear } from '@server/functions/dateTime';

export default async (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	transaction: any[],
	type: 'movie' | 'tv'
) => {

	const movies = getMoviesDB()
		.map(m => m.id);
	const tvs = selectTvsDB()
		.map(m => m.id);

	for (const recommendation of req.recommendations.results as Array<Movie | TvShow>) {

		const palette: any = {
			poster: undefined,
			backdrop: undefined,
		};

		const blurHash: any = {
			poster: undefined,
			backdrop: undefined,
		};

		await Promise.all([
			// recommendation.poster_path && createBlurHash(`https://image.tmdb.org/t/p/w185${recommendation.poster_path}`).then((hash) => {
			// 	blurHash.poster = hash;
			// }),
			// recommendation.backdrop_path && createBlurHash(`https://image.tmdb.org/t/p/w185${recommendation.backdrop_path}`).then((hash) => {
			// 	blurHash.backdrop = hash;
			// }),
			recommendation.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${recommendation.poster_path}`)
				.then((hash) => {
					palette.poster = hash;
				}),
			recommendation.backdrop_path && colorPalette(`https://image.tmdb.org/t/p/w185${recommendation.backdrop_path}`)
				.then((hash) => {
					palette.backdrop = hash;
				}),
		]);

		try {
			insertRecommendation({
				backdrop: recommendation.backdrop_path,
				media_id: recommendation.id,
				overview: recommendation.overview,
				poster: recommendation.poster_path,
				blurHash: JSON.stringify(blurHash),
				color_palette: JSON.stringify(palette),
				movieFrom_id: type === 'movie'
					?					req.id
					:					undefined,
				movieTo_id: type === 'movie' && movies.includes(recommendation.id)
					?					recommendation.id
					:					undefined,
				tvFrom_id: type === 'tv'
					?					req.id
					:					undefined,
				tvTo_id: type === 'tv' && tvs.includes(recommendation.id)
					?					recommendation.id
					:					undefined,
				title: (recommendation as TvShow).name ?? (recommendation as Movie).title,
				titleSort: createTitleSort((recommendation as TvShow).name ?? (recommendation as Movie).title,
					parseYear((recommendation as TvShow).first_air_date ?? (recommendation as Movie).release_date)),
			}, type);
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['recommendation', error]),
			});
		}
	}
};
