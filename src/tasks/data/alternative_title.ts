import { Prisma } from '@prisma/client'
import { CompleteTvAggregate } from './fetchTvShow';
import { CompleteMovieAggregate } from './fetchMovie';
import { AlternativeTitles } from '../../providers/tmdb/tv/index';
import { MovieAlternativeTitles } from '../../providers/tmdb/movie/index';

export default async (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	alternative_titleArray: Array<
		Prisma.AlternativeTitlesCreateOrConnectWithoutTvInput | Prisma.AlternativeTitlesCreateOrConnectWithoutMovieInput
	>,
	table: 'movie' | 'tv'
) => {
	for (const alternative_title of (req.alternative_titles as AlternativeTitles)?.results ??
		(req.alternative_titles as MovieAlternativeTitles)?.titles) {
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
