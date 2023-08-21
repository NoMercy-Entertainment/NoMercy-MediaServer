import express from 'express';
import music from '../media/music/index';
import musicAdd from '../media/music/playlist/add';
import musicAlbum from '../media/music/album';
import musicAlbums from '../media/music/albums';
import musicArtist from '../media/music/artist';
import musicArtists from '../media/music/artists';
import musicCoverImage from '../media/music/coverImage';
import musicDelete from '../media/music/playlist/delete';
import musicEdit from '../media/music/playlist/edit';
import musicFavorites from '../media/music/favorite';
import musicGenre from '../media/music/genre';
import musicGenres from '../media/music/genres';
import musicImages from '../media/music/images';
import musicLike from '../media/music/like';
import musicLyrics from '../media/music/lyrics';
import musicPlaylist from '../media/music/playlist/get';
import musicPlaylists from '../media/music/playlist';
import musicSearch from '../media/music/search';
import musicTypeSearch from '../media/music/typeSearch';
import { asc, eq, like } from 'drizzle-orm';
import { artists } from '@server/db/media/schema/artists';
import { parseYear } from '@server/functions/dateTime';

const router = express.Router();

router.post('/', music);

router.post('/genres', musicGenres);
router.post('/genre/:id', musicGenre);

router.post('/album/:id', musicAlbum);
router.post('/artist/:id', musicArtist);

router.post('/playlists', musicPlaylists);
router.post('/playlist/:id', musicPlaylist);
router.post('/playlist/:id/edit', musicEdit);
router.post('/playlist/:id/add', musicAdd);
router.post('/playlist/:id/delete', musicDelete);

router.post('/collection/tracks', musicFavorites);
router.post('/collection/artists', musicArtists);
router.post('/collection/albums', musicAlbums);
router.post('/collection/playlists', musicPlaylists);

router.post('/tracks/:id/like', musicLike);
router.post('/lyrics', musicLyrics);
router.post('/search', musicSearch);
router.post('/search/:query/:type', musicTypeSearch);
router.post('/coverimage', musicCoverImage);
router.post('/images', musicImages);

interface PlaylistItem {
    id: string;
    file: string;
    coverImage: string;
    duration: string;
    trackNumber: number;
    year: number;
    title: string;
    description: string;
    artist: {
        id: string;
        name: string;
        coverImage: string;
    },
    albums: {
        id: string;
        title: string;
        description: string;
        coverImage: string;
        year: number;
    },
};

router.post('/test', (req, res) => {
	const a = globalThis.mediaDb.query.artists.findMany({
		orderBy: asc(artists.name),
		where: like(artists.name, `%${req.body.artist}%`),
		columns: {
			id: true,
			name: true,
			cover: true,
		},
	});

	const response: ({
        id: string;
        name: string;
        cover: string;
    })[] = [];

	for (const artist of a) {
		response.push({
			id: artist.id,
			name: artist.name,
			cover: `https://217-19-26-119.1968dcdc-bde6-4a0f-a7b8-5af17afd8fb6.nomercy.tv:7635/images/music/${artist.id}.jpg`,
		});
	}

	return res.json(response);
});

router.post('/test/:id', (req, res) => {
	const artist = globalThis.mediaDb.query.artists.findFirst({
		where: eq(artists.id, req.params.id as string),
		orderBy: asc(artists.name),

		columns: {
			id: true,
			name: true,
			cover: true,
		},
		with: {
			artist_track: {
				columns: {},
				with: {
					track: {
						columns: {
							id: true,
							folder_id: true,
							folder: true,
							filename: true,
							duration: true,
							track: true,
							date: true,
							cover: true,
							name: true,
							colorPalette: true,
						},
						with: {
							album_track: {
								columns: {},
								with: {
									album: {
										columns: {
											id: true,
											name: true,
											cover: true,
											description: true,
											year: true,
										},
									},
								},
							},
							musicGenre_track: {
								columns: {},
								with: {
									musicGenre: {
										columns: {
											name: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	const response = artist?.artist_track.filter(t => !t.track.filename?.endsWith('.flac')).map(({ track }) => {
		return {
			id: track.id,
			file: encodeURI(`https://217-19-26-119.1968dcdc-bde6-4a0f-a7b8-5af17afd8fb6.nomercy.tv:7635/${track.folder_id}${track.folder}${track.filename}`).replace(/#/gu, '%23'),
			coverImage: `https://217-19-26-119.1968dcdc-bde6-4a0f-a7b8-5af17afd8fb6.nomercy.tv:7635/images/music/${track.id}.jpg`,
			duration: track.duration ?? '',
			trackNumber: track.track ?? 0,
			year: parseYear(track.date ?? undefined) ?? 0,
			title: track.name ?? '',
			description: `${artist.name} - ${track.album_track[0].album.name ?? ''}`,
			colorPalette: JSON.parse(track.colorPalette ?? '{}'),
			artist: {
				id: artist.id,
				name: artist.name,
				coverImage: artist.cover?.replace('http://', 'https://') ?? '',
			},
			albums: {
				id: track.album_track[0].album.id,
				title: track.album_track[0].album.name,
				description: track.album_track[0].album.description ?? '',
				coverImage: track.album_track[0].album.cover?.replace('http://', 'https://') ?? '',
				year: track.album_track[0].album.year ?? 0,
			},
		};
	}) ?? [];

	return res.json(response);
});

export default router;
