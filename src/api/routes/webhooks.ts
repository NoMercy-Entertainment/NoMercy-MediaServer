import music from '../webhooks/music';
import express from 'express';
import tv from '../webhooks/tv';
import movies from '../webhooks/movies';

const router = express.Router();

router.post('/music', music);
router.post('/tv', tv);
router.post('/movies', movies);


export default router;
