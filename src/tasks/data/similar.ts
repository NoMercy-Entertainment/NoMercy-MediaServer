import { confDb } from '../../database/config';
import { Prisma } from '../../database/config/client';
import createBlurHash from '../../functions/createBlurHash';
import { unique } from '../../functions/stringArray';
import { Movie } from '../../providers/tmdb/movie/index';
import { TvShow } from '../../providers/tmdb/tv/index';
import { createTitleSort } from '../../tasks/files/filenameParser';
import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';

export default async (req: CompleteTvAggregate | CompleteMovieAggregate, transaction: Prisma.PromiseReturnType<any>[], table: 'movie' | 'tv') => {

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

	for (const similar of unique<Movie | TvShow>(req.similar.results, 'id')) {

		const blurHash = {
			poster: similar.poster_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${similar.poster_path}`)
				: undefined,
			backdrop: similar.backdrop_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${similar.backdrop_path}`)
				: undefined,
		};

		const similarInsert = Prisma.validator<Prisma.SimilarUncheckedCreateInput>()({
			backdrop: similar.backdrop_path,
			mediaId: similar.id,
			overview: similar.overview,
			poster: similar.poster_path,
			title: (similar as TvShow).name ?? (similar as Movie).title,
			titleSort: createTitleSort((similar as TvShow).name ?? (similar as Movie).title),
			blurHash: JSON.stringify(blurHash),
			movieFromId: table === 'movie'
				? req.id
				: undefined,
			movieToId: table === 'movie' && movies.includes(similar.id)
				? similar.id
				: undefined,
			tvFromId: table === 'tv'
				? req.id
				: undefined,
			tvToId: table === 'tv' && tvs.includes(similar.id)
				? similar.id
				: undefined,
		});

		transaction.push(
			confDb.similar.upsert({
				where: {
					[`${table}FromId_mediaId`]: {
						[`${table}FromId`]: req.id,
						mediaId: similar.id,
					},
				},
				update: similarInsert,
				create: similarInsert,
			})
		);
	}
};
