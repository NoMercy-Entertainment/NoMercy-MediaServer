import genres from '@server/providers/tmdb/genres';
import { insertGenre } from '@server/db/media/actions/genres';

export default async function () {
	const genre = await genres();

	genre.map((g) => {
		insertGenre({
			id: g.id,
			name: g.name,
		});
	});
}
