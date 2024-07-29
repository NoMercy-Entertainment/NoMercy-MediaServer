import _continue from '../userData/continue';
import express from 'express';
import like from '../media/music/like';
import removeContinue from '../userData/continue/remove';
import updateFavorite from '../userData/favorites/update';
import watched from '../userData/watched';
import artistLike from '../media/music/artistLike';
import albumLike from '../media/music/albumLike';
import trackPlayback from '../media/music/trackPlayback';

const router = express.Router();

router.get('/watched', watched);
router.post('/favorites', updateFavorite);
router.get('/continue', _continue);
router.delete('/continue', removeContinue);
router.post('/music/track/like', like);
router.post('/music/artist/like', artistLike);
router.post('/music/album/like', albumLike);
router.post('/music/playback', trackPlayback);

export default router;
