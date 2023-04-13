import { confDb } from '../../database/config';
import { Prisma } from '../../database/config/client';
import createBlurHash from '../../functions/createBlurHash';
import { Movie } from '../../providers/tmdb/movie/index';
import { TvShow } from '../../providers/tmdb/tv/index';
import { createTitleSort } from '../../tasks/files/filenameParser';
import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';

export default async (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	table: 'movie' | 'tv'
) => {

	const movies = await confDb.movie.findMany({
		select: {
			id: true,
		},
	}).then(movie => movie.map(m => m.id));

	const tvs = await confDb.tv.findMany({
		select: {
			id: true,
		},
	}).then(tv => tv.map(m => m.id));

	for (const recommendation of req.recommendations.results as Array<Movie | TvShow>) {

		const blurHash = {
			poster: recommendation.poster_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${recommendation.poster_path}`)
				: undefined,
			backdrop: recommendation.backdrop_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${recommendation.backdrop_path}`)
				: undefined,
		};

		const recommendationInsert = Prisma.validator<Prisma.RecommendationUncheckedCreateInput>()({
			backdrop: recommendation.backdrop_path,
			mediaId: recommendation.id,
			overview: recommendation.overview,
			poster: recommendation.poster_path,
			blurHash: JSON.stringify(blurHash),
			movieFromId: table === 'movie'
				? req.id
				: undefined,
			movieToId: table === 'movie' && movies.includes(recommendation.id)
				? recommendation.id
				: undefined,
			tvFromId: table === 'tv'
				? req.id
				: undefined,
			tvToId: table === 'tv' && tvs.includes(recommendation.id)
				? recommendation.id
				: undefined,
			title: (recommendation as TvShow).name ?? (recommendation as Movie).title,
			titleSort: createTitleSort((recommendation as TvShow).name ?? (recommendation as Movie).title),
		});

		transaction.push(
			confDb.recommendation.upsert({
				where: {
					[`${table}FromId_mediaId`]: {
						[`${table}FromId`]: req.id,
						mediaId: recommendation.id,
					},
				},
				update: recommendationInsert,
				create: recommendationInsert,
			})
		);
	}
};
