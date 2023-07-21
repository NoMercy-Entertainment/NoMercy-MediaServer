import { Movie } from '../../../providers/tmdb/movie';
import { TvShow } from '../../../providers/tmdb/tv';
import i18n from '../../../loaders/i18n';
import { parseTitleAndYear } from '@server/functions/videoFilenameParser';
import { parseYear } from '@server/functions/dateTime';
import { searchMulti } from '../../../providers/tmdb/search';

const searchVideo = async (query) => {

	await i18n.changeLanguage('en');

	const { title, year } = parseTitleAndYear(query);

	const data = await searchMulti(title, year);

	const results = data.map((r) => {
		return {
			...r,
			year: parseYear((r as Movie).release_date || (r as TvShow).first_air_date) ?? null,
		};
	});

	return results;

};

export default searchVideo;
