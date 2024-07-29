/* eslint-disable prefer-promise-reject-errors */
import { Request, Response } from 'express-serve-static-core';
import { trackSort, uniqBy } from '@server/functions/stringArray';

import { deviceId } from '@server/functions/system';
import { selectAlbum } from '@server/db/media/actions/albums';
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
		const music = selectAlbum(id, user);

		if (!music) {
			return reject({
				message: 'You are not authorized to access this album',
				code: 401,
			});
		}

		let art: ArtistImage | null = null;
		try {
			art = await fanart_artist(music.album_artist[0]?.artist_id);
		} catch (error) {
			//
		}

		const results = {
			...music,
			type: 'album',
			cover: music.cover?.replace('http://', 'https://'),
			color_palette: JSON.parse(music.colorPalette ?? '{}'),
			backdrop: art?.artistbackground?.[0]?.url.replace('http://', 'https://') ?? null,
			favorite_album: music.album_user.length > 0,

			track: uniqBy(music.album_track?.map((t) => {
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
					type: 'album',
					lyrics: typeof t.track.lyrics === 'string' && t.track.lyrics.includes('{')
						?						JSON.parse(t.track.lyrics)
						:						t.track.lyrics,
					favorite_track: t.track.track_user.length > 0,
					artistId: music.album_artist[0]?.artist_id,
					origin: deviceId,
					cover: t.track.cover?.replace('http://', 'https://'),
					libraryId: t.track.folder_id,
					color_palette: JSON.parse(t.track.colorPalette ?? '{}'),
					artist_track: artists,

					artist: artists[0],
				};
			}) ?? [], 'name')
				.sort(trackSort),
			year: music.year,
			album_artist: music.description?.includes('Various Artists')
				?				null
				:				music.album_artist?.[0]
					?					{
						id: music.album_artist?.[0].artist.id,
						name: music.album_artist?.[0].artist.name,
						cover: music.album_artist?.[0].artist.cover?.replace('http://', 'https://'),
						description: music.album_artist?.[0].artist.description,
						folder: music.album_artist?.[0].artist.folder,
						libraryId: music.album_artist?.[0].artist.library_id,
						origin: deviceId,
						color_palette: JSON.parse(music.album_artist?.[0].artist.colorPalette ?? '{}'),
					}
					:					null,
		};

		return resolve(results);
	});
};

export interface AlbumResponse {
	id: string;
	name: string;
	description: string | null;
	folder: string | null;
	cover: string | undefined | null;
	country: string | null;
	year: number | null;
	tracks: number | null;
	color_palette: PaletteColors | null;
	blurHash: string | null;
	libraryId: string;
	Artist: Artist[] | null;
	type: string;
	track: track[];
}

interface Artist {
	id: string;
	name: string;
	description: string | null;
	cover: string | null | undefined;
	folder: string | null;
	color_palette:	string | null;
	blurHash?: string | null;
	libraryId: string;
	trackId?: string | null;
	origin: string;
}

interface track {
	id: string;
	name: string;
	track: number | null;
	disc: number | null;
	cover: string | null | undefined;
	date: string | null;
	folder: string | null;
	filename: string;
	duration: string | null;
	quality: number | null;
	path: string;
	color_palette: PaletteColors | null;
	blurHash: string | null;
	Artist: Artist[];
	Album: Album[];
	type: string;
	favorite_track: boolean;
	artistId: string;
	origin: string;
	libraryId: string;
}

interface Album {
	id: string;
	name: string;
	description: string | null;
	folder: string | null;
	cover: string | null;
	country: string | null;
	year: number | null;
	tracks: number | null;
	color_palette:	string | null;
	blurHash: string | null;
	libraryId: string;
}
