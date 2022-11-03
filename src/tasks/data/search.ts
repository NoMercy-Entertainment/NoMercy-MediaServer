import { FolderList, ParsedFileList } from '../../tasks/files/filenameParser';
import { searchMovie, searchTv } from '../../providers/tmdb/search/index';

import {MusicBrainzApi} from 'musicbrainz-api';
import { appVersion } from '../../functions/system';
import { mathPercentage } from '../../functions/stringArray';

export const fallbackSearch = async (type: string, title: FolderList | ParsedFileList) => {
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
				});
		case 'music':

			// const mbApi = new MusicBrainzApi({
			// 	appName: 'NoMercy Mediaserver',
			// 	appVersion: appVersion,
			// 	appContactInfo: 'nomercy.tv'
			// });

			// const artist = await mbApi.searchArtist({
			// 	query: title.name,
			// 	limit: 1,
			// });

			// return artist.artists[0];

			return {};

		default:
			return null;
	}
};
