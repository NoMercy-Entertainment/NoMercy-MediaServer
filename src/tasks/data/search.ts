import { FolderList, ParsedFileList } from '@server/tasks/files/filenameParser';
import { searchMovie, searchTv } from '@server/providers/tmdb/search/index';

import { MusicBrainzApi } from 'musicbrainz-api';
import i18next from 'i18next';
import { matchPercentage } from '@server/functions/stringArray';

const mbApi = new MusicBrainzApi({
	appName: 'NoMercy Mediaserver',
	appContactInfo: 'nomercy.tv',
});

export const fallbackSearch = async (type: string, title: FolderList | ParsedFileList) => {
	if (!title.title && !title.name) return;
	await i18next.changeLanguage('en');

	let currentScore = 0;

	switch (type) {
	case 'tv':
		return await searchTv(title.title ?? title.name, title.year)
			.then((tvs) => {
				let show = tvs[0];

				if (tvs.length == 1) {
					return show;
				}

				for (const tv of tvs) {
					const newScore = matchPercentage(tv.name, title.title ?? title.name);
					if (newScore > currentScore) {
						currentScore = newScore;
						show = tv;
					}
				}

				return show;
			})
			.catch(() => null);
	case 'movie':
		return await searchMovie(title.title ?? title.name, title.year)
			.then((movies) => {
				let show = movies[0];

				if (movies.length == 1) {
					return show;
				}

				for (const movie of movies) {
					const newScore = matchPercentage(movie.title, title.title ?? title.name);
					if (newScore > currentScore) {
						currentScore = newScore;
						show = movie;
					}
				}

				return show;
			});
	case 'music':

		const artist = await mbApi.searchArtist({
			query: title.name,
			limit: 1,
		});

		return artist?.artists?.[0] ?? {};

	default:
		return null;
	}
};
