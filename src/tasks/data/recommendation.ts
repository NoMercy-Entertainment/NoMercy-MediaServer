import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { Movie } from '../../providers/tmdb/movie/index';
import { Prisma } from '@prisma/client'
import { TvShow } from '../../providers/tmdb/tv/index';
import { confDb } from '../../database/config';
import { createTitleSort } from '../../tasks/files/filenameParser';

export default async (req: CompleteTvAggregate | CompleteMovieAggregate, transaction: Prisma.PromiseReturnType<any>[], table: 'movie' | 'tv') => {
	for (const recommendation of req.recommendations.results as Array<Movie | TvShow>) {

		const recommendationInsert = Prisma.validator<Prisma.RecommendationUncheckedCreateInput>()({
			backdrop: recommendation.backdrop_path,
			mediaId: recommendation.id,
			mediaType: table,
			overview: recommendation.overview,
			poster: recommendation.poster_path,
			recommendationableId: req.id,
			recommendationableType: table,
			title: (recommendation as TvShow).name ?? (recommendation as Movie).title,
			titleSort: createTitleSort((recommendation as TvShow).name ?? (recommendation as Movie).title),
		});

		transaction.push(
			confDb.recommendation.upsert({
				where: {
					recommendationableId_recommendationableType_mediaId_mediaType: {
						mediaId: recommendation.id,
						mediaType: table,
						recommendationableId: req.id,
						recommendationableType: table,
					},
				},
				update: recommendationInsert,
				create: recommendationInsert,
			})
		);
	}
};
