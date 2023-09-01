import trailer, { deleteTrailer } from '../media/trailer';

import collectionInfo from '../media/collection/info';
import collections from '../media/collection';
import encodeAndCast from '../media/encodeAndCast';
import express from 'express';
import favorites from '../userData/favorites';
import fonts from '../media/fonts';
import index from '../media';
import libraries from '../media/libraries';
import library from '../media/libraries/index';
import movieAvailable from '../media/movies/available';
import movieInfo from '../media/movies/info';
import movieWatch from '../media/movies/watch';
import people from '../media/person';
import person from '../media/person/info';
import screensaver from '../media/screensaver';
import search from '../media/search';
import specials from '../media/specials';
import specialInfo from '../media/specials/info';
import specialWatch from '../media/specials/watch';
import tvAvailable from '../media/tv/available';
import tvInfo from '../media/tv/info';
import tvWatch from '../media/tv/watch';

const router = express.Router();

router.post('/', index);
router.post('/movie/:id', movieInfo);
router.get('/movie/:id/watch', movieWatch);
router.post('/movie/:id/available', movieAvailable);

router.post('/tv/:id', tvInfo);
router.get('/tv/:id/watch', tvWatch);
router.post('/tv/:id/available', tvAvailable);

router.post('/collections', collections);
router.post('/collection/:id', collectionInfo);

router.post('/specials', specials);
router.post('/special/:id', specialInfo);
router.get('/special/:id/watch', specialWatch);

router.post('/libraries', libraries);
router.post('/libraries/:id', library);

router.post('/people', people);
router.post('/person/:id', person);

router.post('/screensaver', screensaver);

router.post('/fonts', fonts);
router.post('/search', search);

router.post('/trailer/:id', trailer);
router.post('/trailer/:id', deleteTrailer);

router.post('/encodeandcast', encodeAndCast);

router.post('/favorites', favorites);

export default router;
