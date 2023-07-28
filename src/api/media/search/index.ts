import { Request, Response } from 'express';
import { groupBy, matchPercentage, sortBy } from '@server/functions/stringArray';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { parseTitleAndYear } from '@server/functions/videoFilenameParser';
import { parseYear } from '@server/functions/dateTime';
import searchVideo from './searchVideo';
import { inArray, like } from 'drizzle-orm';
import { tvs } from '@server/db/media/schema/tvs';
import { Tv } from '@server/db/media/actions/tvs';
import { Movie } from '@server/db/media/actions/movies';
import { Artist } from '@server/db/media/actions/artists';
import { Album } from '@server/db/media/actions/albums';
import { albums } from '@server/db/media/schema/albums';
import { artists } from '@server/db/media/schema/artists';
import { tracks } from '@server/db/media/schema/tracks';
import { Track } from '@server/db/media/actions/tracks';
import { movies } from '@server/db/media/schema/movies';

export default async function (req: Request, res: Response) {

	let { query, type }: { query: string; type?: string; } = req.body;

	if (!query || query.length < 3) {
		return res.json({
			status: 'error',
			message: 'You need to provide at least 3 characters',
		});
	}

	if (query.includes('artist:') || type == 'artist') {
		type = 'artist';
		query = query.replace('artist:', '');
	} else if (query.includes('album:') || type == 'album') {
		type = 'album';
		query = query.replace('album:', '');
	} else if (query.includes('track:') || type == 'track') {
		type = 'track';
		query = query.replace('track:', '');
	} else if (query.includes('tv:') || type == 'tv') {
		type = 'tv';
		query = query.replace('tv:', '');
	} else if (query.includes('movie:') || type == 'movie') {
		type = 'movie';
		query = query.replace('movie:', '');
	}

	const { title, year } = parseTitleAndYear(query);

	let movie: any[] = [];
	let tv: any[] = [];
	let person: any = [];

	if (!type || type == 'tv' || type == 'movie' || type == 'person') {
		const video = await searchVideo(query);
		const { movie: m, tv: t, person: p } = groupBy(video, 'media_type');
		movie = m;
		tv = t;
		person = p;
	}

	const TV: Tv[] = [];
	const MOVIE: Movie[] = [];
	const ARTIST: Artist[] = [];
	const ALBUM: Album[] = [];
	const TRACK: Track[] = [];

	if ((!type || type == 'tv') && tv?.length > 0) {
		const tvRes = globalThis.mediaDb.select().from(tvs)
  			.where(inArray(tvs.id, tv?.map((t: { id: any; }) => t.id) ?? []))
			.all();
		TV.push(...tvRes);
		// console.log(tvRes);
	}

	if ((!type || type == 'movie') && movie?.length > 0) {
		const movieRes = globalThis.mediaDb.select().from(movies)
  			.where(inArray(movies.id, movie?.map((t: { id: any; }) => t.id) ?? []))
			.all();
		MOVIE.push(...movieRes);
		// console.log( movieRes);
	}

	if (!type || type == 'album') {
		const albumRes = globalThis.mediaDb.select().from(albums)
  			.where(like(albums.name, `%${query}%`))
			.all();
		ALBUM.push(...albumRes);
		// console.log(albumRes);
	}

	if (!type || type == 'artist') {
		const artistRes = globalThis.mediaDb.select().from(artists)
  			.where(like(artists.name, `%${query}%`))
			.all();
		ARTIST.push(...artistRes);
		// console.log(artistRes);
	}

	if (!type || type == 'track') {
		const trackRes = globalThis.mediaDb.select().from(tracks)
  			.where(like(tracks.name, `%${query}%`))
			.all();
		TRACK.push(...trackRes);
		// console.log(trackRes);
	}

	const videoResponse: any[] = [
		...(movie?.map((m: { id: number; title: string; release_date: any; }) => {
			const item = MOVIE.find(M => M.id == m.id);
			return {
				...m,
				have: !!item,
				titleSort: createTitleSort(item?.title ?? m.title),
				year: parseYear(item?.releaseDate ?? m.release_date),
				match: m.title.toLowerCase().startsWith(title.toLowerCase()),
				matchPercentage: matchPercentage(title.toLowerCase(), item?.title.toLowerCase() ?? m.title.toLowerCase()),
			};
		}) ?? []),
		...(tv?.map((t: { id: number; name: string; first_air_date: any; }) => {
			const item = TV.find(T => T.id == t.id);
			return {
				...t,
				have: item?.haveEpisodes,
				total: item?.numberOfEpisodes,
				titleSort: createTitleSort(item?.title ?? t.name),
				year: parseYear(item?.firstAirDate ?? t.first_air_date),
				match: t.name.toLowerCase().startsWith(title.toLowerCase()),
				matchPercentage: matchPercentage(title.toLowerCase(), item?.title.toLowerCase() ?? t.name.toLowerCase()),
			};
		}) ?? []),
	];

	const artistResponseData: any[] = [
		...(ARTIST?.map((t) => {
			return {
				...t,
				titleSort: createTitleSort(t.name),
				media_type: 'artist',
				match: t.name.toLowerCase().startsWith(query.toLowerCase()),
				matchPercentage: matchPercentage(query.toLowerCase(), t.name.toLowerCase()),
			};
		}) ?? []),
	];
	const albumResponseData: any[] = [
		...(ALBUM?.map((t) => {
			return {
				...t,
				titleSort: createTitleSort(t.name),
				media_type: 'album',
				year: t.year,
				match: t.name.toLowerCase().startsWith(query.toLowerCase()),
				matchPercentage: matchPercentage(query.toLowerCase(), t.name.toLowerCase()),
			};
		}) ?? []),
	];
	const trackResponseData: any[] = [
		...(TRACK?.map((t) => {
			return {
				...t,
				titleSort: createTitleSort(t.name as string),
				media_type: 'track',
				year: t.date,
				match: (t.name as string).toLowerCase().startsWith(query.toLowerCase()),
				matchPercentage: matchPercentage(query.toLowerCase(), (t.name as string).toLowerCase()),
			};
		}) ?? []),
	];

	// console.log(data);

	return res.json({
		artist: sortBy(artistResponseData, 'matchPercentage', 'desc'),
		album: sortBy(albumResponseData, 'matchPercentage', 'desc'),
		track: sortBy(trackResponseData, 'matchPercentage', 'desc'),
		video: sortBy(videoResponse, 'matchPercentage', 'desc'),
		person,
	});

}
