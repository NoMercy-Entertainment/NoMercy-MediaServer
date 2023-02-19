import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { Prisma } from '../../database/config/client';

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
