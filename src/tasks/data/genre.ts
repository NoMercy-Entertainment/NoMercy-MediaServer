import { Prisma } from '@prisma/client'
import { CompleteTvAggregate } from './fetchTvShow';
import { CompleteMovieAggregate } from './fetchMovie';

export default function (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	genresArray: Prisma.GenreMovieCreateOrConnectWithoutMovieInput[] | Prisma.GenreTvCreateOrConnectWithoutTvInput[],
	table: 'movie' | 'tv'
) {
	for (const genre of req.genres) {
		genresArray.push({
			where: {
				[`genre_${table}_unique`]: {
					genreId: genre.id,
					[`${table}Id`]: req.id,
				},
			},
			create: {
				genreId: genre.id,
			},
		});
	}
}
