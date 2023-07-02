import { Album, Artist, Movie, Track, Tv } from '../../../database/config/client';
import { Request, Response } from 'express';
import { groupBy, matchPercentage, sortBy } from '../../../functions/stringArray';

import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { parseTitleAndYear } from '../../../functions/videoFilenameParser';
import { parseYear } from '../../../functions/dateTime';
import searchVideo from './searchVideo';

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

	await Promise.all([
		(!type || type == 'tv') && confDb.tv.findMany({
			where: {
				id: {
					in: tv?.map((t: { id: any; }) => t.id) ?? [],
				},
				firstAirDate: {
					contains: year ?? undefined,
				},
			},
		}).then(data => TV.push(...data)),
		(!type || type == 'movie') && confDb.movie.findMany({
			where: {
				id: {
					in: movie?.map((m: { id: any; }) => m.id) ?? [],
				},
				releaseDate: {
					contains: year ?? undefined,
				},
			},
		}).then(data => MOVIE.push(...data)),
		(!type || type == 'album') && confDb.album.findMany({
			where: {
				name: {
					contains: query,
				},
			},
		}).then(data => ALBUM.push(...data)),
		(!type || type == 'artist') && confDb.artist.findMany({
			where: {
				name: {
					contains: query,
				},
			},
		}).then(data => ARTIST.push(...data)),
		(!type || type == 'track') && confDb.track.findMany({
			where: {
				name: {
					contains: query,
				},
			},
		}).then(data => TRACK.push(...data)),
	]);

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
				titleSort: createTitleSort(t.name),
				media_type: 'track',
				year: t.date,
				match: t.name.toLowerCase().startsWith(query.toLowerCase()),
				matchPercentage: matchPercentage(query.toLowerCase(), t.name.toLowerCase()),
			};
		}) ?? []),
	];

	// console.log(data);

	return res.json({
		video: sortBy(videoResponse, 'matchPercentage', 'desc'),
		artist: sortBy(artistResponseData, 'matchPercentage', 'desc'),
		album: sortBy(albumResponseData, 'matchPercentage', 'desc'),
		track: sortBy(trackResponseData, 'matchPercentage', 'desc'),
		person,
	});

}
