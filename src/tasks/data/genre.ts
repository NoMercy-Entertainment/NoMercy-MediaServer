import { insertGenre } from '@/db/media/actions/genres';
import { Prisma } from '../../database/config/client';
import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import Logger from '@/functions/logger/logger';
import { insertGenreMovie } from '@/db/media/actions/genre_movie';
import { insertGenreTv } from '@/db/media/actions/genre_tv';

export default function (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	genresArray: Prisma.GenreMovieCreateOrConnectWithoutMovieInput[] | Prisma.GenreTvCreateOrConnectWithoutTvInput[],
	table: 'movie' | 'tv'
) {
	for (const genre of req.genres) {
		try {
			insertGenre({
				id: genre.id,
				name: genre.name,
			});

			if (table === 'movie') {
				insertGenreMovie({
					genre_id: genre.id,
					movie_id: req.id,
				});
			} else {
				insertGenreTv({
					genre_id: genre.id,
					tv_id: req.id,
				});
			}
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['genre', error]),
			});
		}

	}
}

