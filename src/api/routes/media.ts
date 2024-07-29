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
import specialAvailable from '../media/specials/available';
import tvAvailable from '../media/tv/available';
import tvInfo from '../media/tv/info';
import tvWatch from '../media/tv/watch';

const router = express.Router();

router.get('/', index);
router.get('/movie/:id', movieInfo);
router.get('/movie/:id/watch', movieWatch);
router.get('/movie/:id/available', movieAvailable);

router.get('/tv/:id', tvInfo);
router.get('/tv/:id/watch', tvWatch);
router.get('/tv/:id/available', tvAvailable);

router.get('/collection', collections);
router.get('/collection/:id', collectionInfo);

router.get('/specials', specials);
router.get('/specials/:id', specialInfo);
router.get('/specials/:id/watch', specialWatch);
router.get('/specials/:id/available', specialAvailable);

router.get('/libraries', libraries);
router.get('/libraries/:id', library);

router.get('/person', people);
router.get('/person/:id', person);

router.get('/screensaver', screensaver);

router.get('/fonts', fonts);
router.get('/search', search);

router.get('/trailer/:id', trailer);
router.get('/trailer/:id', deleteTrailer);

router.post('/encodeandcast', encodeAndCast);

router.post('/favorites', favorites);

export default router;
