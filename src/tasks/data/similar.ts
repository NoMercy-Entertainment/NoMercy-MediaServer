import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import { Movie } from '../../providers/tmdb/movie/index';
import { TvShow } from '../../providers/tmdb/tv/index';
import { unique } from '../../functions/stringArray';
import { createTitleSort } from '../../tasks/files/filenameParser';
import { CompleteTvAggregate } from './fetchTvShow';
import { CompleteMovieAggregate } from './fetchMovie';

export default async (req: CompleteTvAggregate | CompleteMovieAggregate, transaction: Prisma.PromiseReturnType<any>[], table: 'movie' | 'tv') => {

	for (const similar of unique<Movie | TvShow>(req.similar.results, 'id')) {

		const similarInsert = Prisma.validator<Prisma.SimilarCreateInput>()({
			backdrop: similar.backdrop_path,
			mediaId: similar.id,
			mediaType: table,
			overview: similar.overview,
			poster: similar.poster_path,
			similarableId: req.id,
			similarableType: table,
			title: (similar as TvShow).name ?? (similar as Movie).title,
			titleSort: createTitleSort((similar as TvShow).name ?? (similar as Movie).title),
		});

		// transaction.push(
		await	confDb.similar.upsert({
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
		// );
	}
}
