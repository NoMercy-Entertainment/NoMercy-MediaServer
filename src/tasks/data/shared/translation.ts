import { CompleteMovieAggregate } from '../movie/fetchMovie';
import { CompleteTvAggregate } from '../tv/fetchTvShow';
import { EpisodeAppend } from '@server/providers/tmdb/episode/index';
import { MovieTranslation } from '@server/providers/tmdb/movie/index';
import { PersonAppend } from '@server/providers/tmdb/people/details';
import { SeasonAppend } from '@server/providers/tmdb/season/index';
import { TvShowTranslation } from '@server/providers/tmdb/tv/index';
import { insertTranslation } from '@server/db/media/actions/translations';
import Logger from '@server/functions/logger/logger';

export default (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | CompleteMovieAggregate | PersonAppend,
	transaction: any[],
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
