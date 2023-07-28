
import { CompleteTvAggregate } from '../tv/fetchTvShow';
import { CompleteMovieAggregate } from '../movie/fetchMovie';
import { MovieKeywords } from '@server/providers/tmdb/movie/index';
import { TvKeywords } from '@server/providers/tmdb/tv/index';
import { insertKeyword } from '@server/db/media/actions/keywords';
import { insertKeywordMovie } from '@server/db/media/actions/keyword_movie';
import { insertKeywordTv } from '@server/db/media/actions/keyword_tv';
import Logger from '@server/functions/logger/logger';
import { Movie } from '@server/db/media/actions/movies';
import { Tv } from '@server/db/media/actions/tvs';

export default (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	transaction: any[],
	keywordsInsert: Array<Movie | Tv>,
	table: 'movie' | 'tv'
) => {
	for (const keyword of (req.keywords as TvKeywords).results ?? (req.keywords as MovieKeywords).keywords) {

		try {
			insertKeyword({
				id: keyword.id,
				name: keyword.name,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['keyword', error]),
			});
		}

		if (table === 'movie') {
			try {
				insertKeywordMovie({
					keyword_id: keyword.id,
					movie_id: req.id,
				});
			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['keyword_movie', error]),
				});
			}
		} else {
			try {
				insertKeywordTv({
					keyword_id: keyword.id,
					tv_id: req.id,
				});
			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['keyword_tv', error]),
				});
			}
		}

	}
};
