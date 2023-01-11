import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { Movie } from '../../providers/tmdb/movie/index';
import { Prisma } from '@prisma/client';
import { TvShow } from '../../providers/tmdb/tv/index';
import { confDb } from '../../database/config';
import createBlurHash from '../../functions/createBlurHash/createBlurHash';
import { createTitleSort } from '../../tasks/files/filenameParser';
import { unique } from '../../functions/stringArray';

export default async (req: CompleteTvAggregate | CompleteMovieAggregate, transaction: Prisma.PromiseReturnType<any>[], table: 'movie' | 'tv') => {

	for (const similar of unique<Movie | TvShow>(req.similar.results, 'id')) {

		const blurHash = {
			poster: similar.poster_path ? await createBlurHash(`https://image.tmdb.org/t/p/w185${similar.poster_path}`) : undefined,
			backdrop: similar.backdrop_path ? await createBlurHash(`https://image.tmdb.org/t/p/w185${similar.backdrop_path}`) : undefined,
		}

		const similarInsert = Prisma.validator<Prisma.SimilarCreateInput>()({
			backdrop: similar.backdrop_path,
			mediaId: similar.id,
			mediaType: table,
			overview: similar.overview,
			poster: similar.poster_path,
			similarableId: req.id,
			similarableType: table,
			blurHash: JSON.stringify(blurHash),
			title: (similar as TvShow).name ?? (similar as Movie).title,
			titleSort: createTitleSort((similar as TvShow).name ?? (similar as Movie).title),
		});

		transaction.push(
			confDb.similar.upsert({
				where: {
					similarableId_similarableType_mediaId: {
						mediaId: similar.id,
						similarableId: req.id,
						similarableType: table,
					},
				},
				update: similarInsert,
				create: similarInsert,
			})
		);
	}
}
