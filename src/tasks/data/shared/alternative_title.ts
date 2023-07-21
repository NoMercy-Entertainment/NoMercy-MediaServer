import { AlternativeTitle, insertAlternativeTitle } from '@server/db/media/actions/alternativeTitles';
import { MovieAlternativeTitles } from '../../../providers/tmdb/movie/index';
import { AlternativeTitles } from '../../../providers/tmdb/tv/index';
import { CompleteMovieAggregate } from '../movie/fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import Logger from '@server/functions/logger/logger';

export default (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	alternative_titleArray: Array<AlternativeTitle>,
	type: 'movie' | 'tv'
) => {
	for (const alternativeTitle of (req.alternative_titles as AlternativeTitles)?.results
		?? (req.alternative_titles as MovieAlternativeTitles)?.titles ?? []) {

		try {
			insertAlternativeTitle({
				[`${type}_id`]: req.id,
				iso31661: alternativeTitle.iso_3166_1,
				title: alternativeTitle.title,
			}, type);
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['alternative_title', error]),
			});
		}

	}
};
