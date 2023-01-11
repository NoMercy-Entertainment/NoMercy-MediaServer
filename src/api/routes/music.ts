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

const router = express.Router();

router.post('/', music);

router.post('/albums', musicAlbums);
router.post('/album/:id', musicAlbum);

router.post('/artists', musicArtists);
router.post('/artist/:id', musicArtist);

router.post('/genres', musicGenres);
router.post('/genre/:id', musicGenre);

router.post('/playlists', musicPlaylists);
router.post('/playlist/:id', musicPlaylist);
router.post('/playlist/:id/edit', musicEdit);
router.post('/playlist/:id/add', musicAdd);
router.delete('/playlist/:id', musicDelete);

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

export default router;
