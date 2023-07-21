import { Request, Response } from 'express';

import { selectFavoriteTracks } from '@server/db/media/actions/track_user';
import { deviceId } from '@server/functions/system';

export default function (req: Request, res: Response) {

	const music = selectFavoriteTracks(req.user.sub);

	if (!music) {
		return res.json({
			status: 'error',
			message: 'No favorites',
		});
	}

	const results: FavoritesResponse = {
		cover: 'favorites',
		description: null,
		name: 'Songs you like',
		type: 'playlist',
		track: music.map((t) => {

			const artists = t.track.artist?.map(a => ({
				id: a.id,
				name: a.name,
				cover: a.cover,
				description: a.description,
				folder: a.folder,
				libraryId: a.library_id,
				origin: deviceId,
				colorPalette: JSON.parse(a.colorPalette ?? '{}'),
			}));
			const albums = t.track.album?.map(a => ({
				id: a.id,
				name: a.name,
				folder: a.folder,
				cover: a.cover,
				description: a.description,
				libraryId: a.library_id,
				origin: deviceId,
				colorPalette: JSON.parse(a.colorPalette ?? '{}'),
			}));

			return {
				...t.track,
				type: 'favorite',
				date: t.track.date,
				lyrics: undefined,
				favorite_track: true,
				libraryId: t.track.folder_id,
				artistId: artists?.[0]?.id,
				origin: deviceId,
				cover: albums?.[0]?.cover,
				colorPalette: albums?.[0]?.colorPalette,
				artist_track: artists,
				album_track: albums,
				album: albums?.[0],
				artist: artists[0],
			};
		}),
	};

	return res.json(results);

}

export interface FavoritesResponse {
    cover: string;
    description: null;
    name: string;
    type: string;
    track: track[];
}

export interface track {
    type: string;
    date: string | null;
    lyrics: undefined;
    favorite_track: boolean;
    libraryId: string;
    artistId: string;
    origin: string;
    cover: string | null;
    colorPalette: any;
    artist_track: Artist[];
    album: Album;
    created_at: string;
    name: string | null;
    updated_at: string;
    id: string;
    track: number | null;
    disc: number | null;
    folder: string | null;
    filename: string | null;
    duration: string | null;
    quality: number | null;
    path: string | null;
    blurHash: string | null;
    folder_id: string;
}

export interface Artist {
    id: string;
    name: string;
    cover: string | null;
    description: string | null;
    folder: string | null;
    libraryId: string;
    origin: string;
    colorPalette: any;
}

export interface Album {
    id: string;
    name: string;
    folder: string | null;
    cover: string | null;
    description: string | null;
    libraryId: string;
    origin: string;
    colorPalette: any;
}
