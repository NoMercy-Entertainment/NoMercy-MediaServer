import express from 'express';
import music from '../media/music/index';
import musicAdd from '../media/music/playlist/add';
import musicAlbum from '../media/music/album';
import musicAlbums from '../media/music/albums';
import musicArtist from '../media/music/artist';
import musicArtists from '../media/music/artists';
import musicCoverImage from '../media/music/coverImage';
import musicCreate from '../media/music/playlist/create';
import musicDelete from '../media/music/playlist/delete';
import musicEdit from '../media/music/playlist/edit';
import musicFavorites from '../media/music/favorite';
import musicGet from '../media/music/playlist/get';
import musicImages from '../media/music/images';
import musicLike from '../media/music/like';
import musicLyrics from '../media/music/lyrics';
import musicPlaylist from '../media/music/playlist/get';
import musicPlaylists from '../media/music/playlist';
import musicSearch from '../media/music/search';
import musicTypeSearch from '../media/music/typeSearch';

const router = express.Router();

router.get('/', music);

router.get('/albums', musicAlbums);
router.get('/album/:id', musicAlbum);

router.get('/artists', musicArtists);
router.get('/artist/:id', musicArtist);

router.get('/playlists', musicPlaylists);
router.get('/playlist/:id', musicPlaylist);
router.post('/playlist/:id', musicEdit);
router.put('/playlist/:id', musicAdd);
router.delete('/playlist/:id', musicDelete);

router.get('/collection/tracks', musicFavorites);
router.get('/collection/artists', musicArtists);
router.get('/collection/albums', musicAlbums);

router.post('/tracks/:id/like', musicLike);
router.get('/lyrics', musicLyrics);
router.get('/search', musicSearch);
router.get('/search/:query/:type', musicTypeSearch);
router.post('/coverimage', musicCoverImage);
router.get('/images', musicImages);

export default router;
