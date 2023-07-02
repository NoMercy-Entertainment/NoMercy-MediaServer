import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { MovieTranslation } from '../../providers/tmdb/movie/index';
import { PersonAppend } from '../../providers/tmdb/people/details';
import { Prisma } from '../../database/config/client';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import { TvShowTranslation } from '../../providers/tmdb/tv/index';
import { insertTranslation } from '@/db/media/actions/translations';
import Logger from '@/functions/logger/logger';

export default (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | CompleteMovieAggregate | PersonAppend,
	transaction: Prisma.PromiseReturnType<any>[],
	type: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'collection'
) => {
	for (const translation of req.translations.translations as Array<MovieTranslation | TvShowTranslation>) {
		try {
			insertTranslation({
				englishName: translation.english_name,
				homepage: translation.homepage,
				iso31661: translation.iso_3166_1,
				iso6391: translation.iso_639_1,
				name: translation.name,
				overview: translation.data?.overview,
				title: (translation as MovieTranslation).data?.title || (translation as TvShowTranslation).data?.name,

				movie_id: type === 'movie'
					? req.id
					: null,
				tv_id: type === 'tv'
					? req.id
					: null,
				season_id: type === 'season'
					? req.id
					: null,
				episode_id: type === 'episode'
					? req.id
					: null,
				person_id: type === 'person'
					? req.id
					: null,
			}, type);
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['translation', error]),
			});
		}
	}
};
