import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { Movie } from '../../providers/tmdb/movie/index';
import { Prisma } from '../../database/config/client';
import { TvShow } from '../../providers/tmdb/tv/index';
import colorPalette from '@/functions/colorPalette/colorPalette';
import { confDb } from '../../database/config';
import createBlurHash from '../../functions/createBlurHash';
import { createTitleSort } from '../../tasks/files/filenameParser';

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

		const palette: any = {
			poster: undefined,
			backdrop: undefined,
		};

		const blurHash: any = {
			poster: undefined,
			backdrop: undefined,
		};

		await Promise.all([
			recommendation.poster_path && createBlurHash(`https://image.tmdb.org/t/p/w185${recommendation.poster_path}`).then((hash) => {
				blurHash.poster = hash;
			}),
			recommendation.backdrop_path && createBlurHash(`https://image.tmdb.org/t/p/w185${recommendation.backdrop_path}`).then((hash) => {
				blurHash.backdrop = hash;
			}),
			recommendation.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${recommendation.poster_path}`).then((hash) => {
				palette.poster = hash;
			}),
			recommendation.backdrop_path && colorPalette(`https://image.tmdb.org/t/p/w185${recommendation.backdrop_path}`).then((hash) => {
				palette.backdrop = hash;
			}),
		]);

		const recommendationInsert = Prisma.validator<Prisma.RecommendationUncheckedCreateInput>()({
			backdrop: recommendation.backdrop_path,
			mediaId: recommendation.id,
			overview: recommendation.overview,
			poster: recommendation.poster_path,
			blurHash: JSON.stringify(blurHash),
			colorPalette: JSON.stringify(palette),
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

		// transaction.push(
		await	confDb.recommendation.upsert({
			where: {
				[`${table}FromId_mediaId`]: {
					[`${table}FromId`]: req.id,
					mediaId: recommendation.id,
				},
			},
			update: recommendationInsert,
			create: recommendationInsert,
		});
		// );
	}
};
