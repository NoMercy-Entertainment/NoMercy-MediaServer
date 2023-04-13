import { Prisma } from '../../database/config/client';
import { MovieAlternativeTitles } from '../../providers/tmdb/movie/index';
import { AlternativeTitles } from '../../providers/tmdb/tv/index';
import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';

export default (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	alternative_titleArray: Array<
		Prisma.AlternativeTitlesCreateOrConnectWithoutMovieInput | Prisma.AlternativeTitlesCreateOrConnectWithoutTvInput
	>,
	table: 'movie' | 'tv'
) => {
	for (const alternative_title of (req.alternative_titles as AlternativeTitles)?.results
		?? (req.alternative_titles as MovieAlternativeTitles)?.titles ?? []) {
		alternative_titleArray.push({
			where: {
				[`alternative_titles_${table}_unique`]: {
					[`${table}Id`]: req.id,
					iso31661: alternative_title.iso_3166_1,
				},
			},
			create: {
				iso31661: alternative_title.iso_3166_1,
				title: alternative_title.title,
			},
		});
	}
};
