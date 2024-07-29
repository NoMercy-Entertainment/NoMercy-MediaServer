/* eslint-disable prefer-promise-reject-errors */
import { Request, Response } from 'express-serve-static-core';
import { trackSort, uniqBy } from '@server/functions/stringArray';

import { deviceId } from '@server/functions/system';
import { selectArtist } from '@server/db/media/actions/artists';
import { requestWorker } from '@server/api/requestWorker';
import { PaletteColors } from '@server/types/server';
import { ArtistImage, fanart_artist } from '@server/providers/fanart/music';

export default async function(req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		id: req.params.id,
		user: req.user.sub,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500)
			.json({
				status: 'error',
				message: result.error.message,
			});
	}
	return res.json(result.result);
}

export const exec = ({
	id,
	user,
}: { id: string; user: string; }) => {
	return new Promise(async (resolve, reject) => {

		const music = selectArtist(id, user);

		if (!music) {
			return reject({
				error: {
					message: 'You are not authorized to access this artist',
					code: 401,
				},
			});
		}

		let art: ArtistImage | null = null;
		try {
			art = await fanart_artist(id);
		} catch (error) {
			//
		}

		try {
			const results = {
				...music,
				type: 'artist',
				cover: music.cover,
				backdrop: art?.artistbackground?.[0]?.url.replace('http://', 'https://') ?? null,

				color_palette: JSON.parse(music.colorPalette ?? '{}'),
				blurHash: music.blurHash ?? null,
				favorite_artist: music.artist_user.length > 0,

				track: uniqBy(music.artist_track?.map((t) => {
					const albums = t.track.album_track.map(a => ({
						id: a.album.id,
						name: a.album.name,
						folder: a.album.folder,
						cover: a.album.cover?.replace('http://', 'https://'),
						description: a.album.description,
						libraryId: music.library_id,
						origin: deviceId,
						color_palette: JSON.parse(a.album.colorPalette ?? '{}'),
					}));
					const artists = t.track.artist_track
						// .filter(a => a.artist.id != '89ad4ac3-39f7-470e-963a-56509c546377')
						.map(a => ({
							id: a.artist.id,
							name: a.artist.name,
							cover: a.artist.cover?.replace('http://', 'https://'),
							description: a.artist.description,
							folder: a.artist.folder,
							libraryId: a.artist.library_id,
							origin: deviceId,
							color_palette: JSON.parse(a.artist.colorPalette ?? '{}'),
						}));

					return {
						...t.track,
						date: t.track.date,
						type: 'artist',
						lyrics: typeof t.track.lyrics === 'string' && t.track.lyrics.includes('{')
							?							JSON.parse(t.track.lyrics)
							:							t.track.lyrics,
						favorite_track: t.track.track_user.length > 0,
						origin: deviceId,
						cover: (t.track.cover ?? null)?.replace('http://', 'https://'),
						libraryId: t.track.folder_id,
						blurHash: t.track.blurHash,
						color_palette: JSON.parse(t.track.colorPalette ?? '{}'),
						album_track: albums,
						artist_track: artists,
						album: albums[0],
					};
				}) ?? [], 'name')
					.sort(trackSort),
			};

			return resolve(results);
		} catch (error) {
			console.error(error);
		}
	});
};


export interface ArtistResponse {
	id: string;
	name: string;
	description: null | string;
	cover: null | string | undefined;
	folder: null | string;
	color_palette: PaletteColors | null;
	blurHash: string | null;
	libraryId: string;
	trackId: null | string;
	type: string;
	track: track[] | null;
}

export interface track {
	id: string;
	name: string;
	track: number | null;
	disc: number | null;
	cover: null | string | undefined;
	date: null | string;
	folder: null | string;
	filename: string;
	duration: string | null;
	quality: number | null;
	path: string | null;
	color_palette: PaletteColors | null | undefined;
	blurHash: null | string;
	Artist: Album[];
	Album: Album[];
	type: string;
	favorite_track: boolean;
	origin: string;
	libraryId: string;
}

export interface Album {
	id: string;
	name: string;
	folder: null | string;
	cover: null | string | undefined;
	description: null | string;
	libraryId: string;
	origin: string;
	color_palette: null | string | undefined;
}

