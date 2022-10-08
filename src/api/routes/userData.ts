import watched from '../userData/watched';
import express from 'express';
import _continue from '../userData/continue';
import removeContinue from '../userData/continue/remove';
import favorites from '../userData/favorites';
import updateFavorite from '../userData/favorites/update';

const router = express.Router();

router.post('/watched', watched);
router.get('/favorites', favorites);
router.post('/favorites', updateFavorite);
router.get('/continue', _continue);
router.post('/continue', removeContinue);

export default router;
