import express, { Router } from 'express';

export const group = (callback: (router: Router) => void) => {
	const router = express.Router();
	callback(router);
	return router;
};
