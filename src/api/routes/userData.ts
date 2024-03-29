import _continue from '../userData/continue';
import express from 'express';
import like from '../media/music/like';
import removeContinue from '../userData/continue/remove';
import updateFavorite from '../userData/favorites/update';
import watched from '../userData/watched';

const router = express.Router();

router.post('/watched', watched);
router.post('/favorites/add', updateFavorite);
router.post('/continue', _continue);
router.post('/continue/delete', removeContinue);
router.post('/music/like', like);

export default router;
