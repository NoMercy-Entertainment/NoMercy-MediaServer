import _continue from '../userData/continue';
import express from 'express';
import favorites from '../userData/favorites';
import like from '../media/music/like';
import removeContinue from '../userData/continue/remove';
import updateFavorite from '../userData/favorites/update';
import watched from '../userData/watched';

const router = express.Router();

router.post('/watched', watched);
router.get('/favorites', favorites);
router.post('/favorites', updateFavorite);
router.get('/continue', _continue);
router.post('/continue', removeContinue);
router.post('/music/like', like);

export default router;
