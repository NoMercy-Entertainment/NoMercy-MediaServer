import Logger from '@server/functions/logger';
import { ArtistLatest } from './latest';
import fanartApiClient from '../fanartApiClient';
import { ArtistImage } from './artist';
import { AlbumImage } from './album';

export * from './album';
export * from './artist';
export * from './label';
export * from './latest';

export const fanart_artist = async (id: string) => {
	Logger.log({
		level: 'info',
		name: 'fanart',
		color: 'blue',
		message: `Fetching Music Artist Images with id: ${id}`,
	});

	const params = {
	};

	const { data } = await fanartApiClient.get<ArtistImage>(`music/${id}`, params);

	return data;
};

export const fanart_album = async (id: string) => {
	Logger.log({
		level: 'info',
		name: 'fanart',
		color: 'blue',
		message: `Fetching Music Album Images with id: ${id}`,
	});

	const params = {
	};

	const { data } = await fanartApiClient.get<AlbumImage>(`music/albums/${id}`, params);

	return data;
};

export const fanart_label = async (id: string) => {
	Logger.log({
		level: 'info',
		name: 'fanart',
		color: 'blue',
		message: `Fetching Music Label Images with id: ${id}`,
	});

	const params = {
	};

	const { data } = await fanartApiClient.get<ArtistImage>(`music/labels/${id}`, params);

	return data;
};

export const fanart_tvLatest = async (date = Date.now()) => {
	Logger.log({
		level: 'info',
		name: 'fanart',
		color: 'blue',
		message: 'Fetching Music Latest',
	});

	const { data } = await fanartApiClient.get<ArtistLatest>('music/latest', {
		params: { date },
	});

	return data;
};
