import { insertGenre } from '@server/db/media/actions/genres';
import Logger from '@server/functions/logger/logger';
import { GenreMovie, insertGenreMovie } from '@server/db/media/actions/genre_movie';
import { GenreTv, insertGenreTv } from '@server/db/media/actions/genre_tv';
import { CompleteTvAggregate } from '../tv/fetchTvShow';
import { CompleteMovieAggregate } from '../movie/fetchMovie';

export default function (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	genresArray: Array<GenreTv | GenreMovie>,
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

