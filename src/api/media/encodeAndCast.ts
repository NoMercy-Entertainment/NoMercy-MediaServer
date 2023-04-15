import { AppState, useSelector } from '@/state/redux';
import { Request, Response } from 'express';

export default function (req: Request, res: Response) {

	const chromeCast = useSelector((state: AppState) => state.config.chromeCast);

	chromeCast.load({ file: req.body.file });

	return res.json({
		status: 'ok',
	});

};
