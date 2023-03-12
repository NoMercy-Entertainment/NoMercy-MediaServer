import trailer, { deleteTrailer } from '../media/trailer';

import collectionInfo from '../media/collection/info';
import collections from '../media/collection';
import encodeAndCast from '../media/encodeAndCast';
import express from 'express';
import fonts from '../media/fonts';
import index from '../media';
import libraries from '../media/libraries';
import movieInfo from '../media/movies/info';
import movieWatch from '../media/movies/watch';
import screensaver from '../media/screensaver';
import search from '../media/search';
import specialInfo from '../media/specials/info';
import specials from '../media/specials';
import tvInfo from '../media/tv/info';
import tvWatch from '../media/tv/watch';

const router = express.Router();

router.post('/', index);
router.post('/movie/:id', movieInfo);
router.post('/movie/:id/watch', movieWatch);

router.post('/tv/:id', tvInfo);
router.post('/tv/:id/watch', tvWatch);

router.post('/collections', collections);
router.post('/collection/:id', collectionInfo);

router.post('/specials', specials);
router.post('/special/:id', specialInfo);

router.post('/libraries', libraries);
router.post('/libraries/:id', libraries);

router.post('/screensaver', screensaver);

router.get('/fonts', fonts);
router.post('/search', search);

router.get('/trailer/:id', trailer);
router.delete('/trailer/:id', deleteTrailer);

router.post('/encodeandcast', encodeAndCast);

export default router;
