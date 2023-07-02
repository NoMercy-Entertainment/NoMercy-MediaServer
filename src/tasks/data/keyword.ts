import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { MovieKeywords } from '../../providers/tmdb/movie/index';
import { Prisma } from '../../database/config/client';
import { TvKeywords } from '../../providers/tmdb/tv/index';
import { insertKeyword } from '@/db/media/actions/keywords';
import { insertKeywordMovie } from '@/db/media/actions/keyword_movie';
import { insertKeywordTv } from '@/db/media/actions/keyword_tv';
import Logger from '@/functions/logger/logger';

export default (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	keywordsInsert: Array<Prisma.KeywordMovieCreateOrConnectWithoutMovieInput | Prisma.KeywordTvCreateOrConnectWithoutTvInput>,
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
