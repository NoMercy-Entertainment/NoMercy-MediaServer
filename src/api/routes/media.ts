import express from 'express';

import index from '../media';

import movieInfo from '../media/movies/info';
import movieWatch from '../media/movies/watch';

import tvInfo from '../media/tv/info';
import tvWatch from '../media/tv/watch';

import collections from '../media/collection';
import collectionInfo from '../media/collection/info';

import libraries from '../media/libraries';

import screensaver from '../media/screensaver';

const router = express.Router();

router.post('/', index);
router.post('/movies/:id', movieInfo);
router.post('/movies/:id/watch', movieWatch);

router.post('/tv/:id', tvInfo);
router.post('/tv/:id/watch', tvWatch);

router.post('/collections', collections);
router.post('/collections/:id', collectionInfo);

router.post('/libraries', libraries);
router.post('/libraries/:id', libraries);

router.post('/screensaver', screensaver);

export default router;
