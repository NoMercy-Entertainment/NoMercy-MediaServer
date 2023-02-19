import {
	FolderList,
	ParsedFileList
} from '../../tasks/files/filenameParser';
import {
	searchMovie,
	searchTv
} from '../../providers/tmdb/search/index';

import { MusicBrainzApi } from 'musicbrainz-api';
import { appVersion } from '../../functions/system';
import {
	matchPercentage
} from '../../functions/stringArray';

const mbApi = new MusicBrainzApi({
	appName: 'NoMercy Mediaserver',
	appVersion: appVersion,
	appContactInfo: 'nomercy.tv',
});

export const fallbackSearch = async (type: string, title: FolderList | ParsedFileList) => {
	if (!title.title && !title.name) return;

	switch (type) {
	case 'tv':
		return await searchTv(title.title ?? title.name, title.year)
			.then((tvs) => {
				let show = tvs[0];
				let match = 0;
				if (tvs.length > 1) {
					for (const tv of tvs) {
						if (matchPercentage(tv.name, title.title ?? title.name) > match) {
							match = matchPercentage(tvs[0].name, title.title ?? title.name);
							show = tv;
						}
					}
				}
				return show;
			})
			.catch(() => null);
	case 'movie':
		return await searchMovie(title.title ?? title.name, title.year)
			.then((movies) => {
				let show = movies[0];
				let match = 0;

				if (movies.length > 1) {
					for (const movie of movies) {
						if (matchPercentage(title.title ?? title.name, movie.title) > match) {
							match = matchPercentage(title.title ?? title.name, movie.title);
							show = movie;
						}
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
