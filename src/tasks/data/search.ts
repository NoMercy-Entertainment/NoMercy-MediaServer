import { searchMovie, searchTv } from '../../providers/tmdb/search/index';
import { mathPercentage } from '../../functions/stringArray';
import { FolderList } from '../../tasks/files/filenameParser';

export const fallbackSearch = async (type: string, title: FolderList) => {
	switch (type) {
		case 'tv':
			return await searchTv(title.title, title.year)
				.then((tvs) => {
					let show = tvs[0];
					let match = 0;
					if (tvs.length > 1) {
						for (const tv of tvs) {
							if (mathPercentage(tv.name, title.title) > match) {
								match = mathPercentage(tvs[0].name, title.title);
								show = tv;
							}
						}
					}
					return show;
				})
				.catch(() => null);
		case 'movie':
			return await searchMovie(title.title, title.year)
				.then((movies) => {
					let show = movies[0];
					let match = 0;

					if (movies.length > 1) {
						for (const movie of movies) {
							if (mathPercentage(title.title, movie.title) > match) {
								match = mathPercentage(title.title, movie.title);
								show = movie;
							}
						}
					}
					return show;
				})
				.catch(() => null);
		case 'music':
			return null;
		default:
			return null;
	}
};
