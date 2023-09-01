import express from 'express';
import { Request, Response } from 'express-serve-static-core';

import dashboard from './routes/dashboard';
import media from './routes/media';
import music from './routes/music';
import userData from './routes/userData';
import { callback } from '@server/functions/auth/callback';

const router = express.Router();

router.get('/me', (req: Request, res: Response) => {
	return res.json(req.user);
});

router.get('/sso-callback', callback);

router.use('/dashboard', dashboard);
router.use('/userdata', userData);
router.use('/music', music);
router.use('/', media);

export default router;

