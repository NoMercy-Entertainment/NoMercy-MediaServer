import { AxiosResponse } from 'axios';
import { Movie } from '../movie/movie';
import { PaginatedResponse } from '../helpers';
import { Person } from '../people/person';
import { TvShow } from '../tv/tv';
import tmdbClient from '../tmdbClient';

export const trending = async (window = 'day', limit = 10) => {
	const res: {
		movieTrending: Movie[];
		tvTrending: TvShow[];
		personTrending: Person[];
	} = {
		movieTrending: [],
		tvTrending: [],
		personTrending: [],
	};

	const { data } = await new tmdbClient().get<PaginatedResponse<Person | Movie | TvShow>>(`trending/all/${window}`, { params: { page: 1 } });

	for (let j = 0; j < data.results.length; j++) {
		if (data.results[j].media_type === 'movie') {
			res.movieTrending.push(data.results[j] as Movie);
		} else if (data.results[j].media_type === 'tv') {
			res.tvTrending.push(data.results[j] as TvShow);
		} else if (data.results[j].media_type === 'person') {
			res.personTrending.push(data.results[j] as Person);
		}
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<TvShow | Movie | Person>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(new tmdbClient().get<PaginatedResponse<Person | Movie | TvShow>>(`trending/all/${window}`, { params: { page: i } }));
	}

	const data2 = await Promise.all(promises);

	for (let g = 0; g < data2.length && g < limit && g < 1000; g++) {
		for (let j = 0; j < data2[g].data.results.length; j++) {
			if (data2[g].data.results[j].media_type === 'movie') {
				res.movieTrending.push(data2[g].data.results[j] as Movie);
			} else if (data2[g].data.results[j].media_type === 'tv') {
				res.tvTrending.push(data2[g].data.results[j] as TvShow);
			} else if (data2[g].data.results[j].media_type === 'person') {
				res.personTrending.push(data2[g].data.results[j] as Person);
			}
		}
	}

	return res;
};

export default trending;
