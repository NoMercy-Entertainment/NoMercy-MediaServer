import { AppState, useSelector } from '@server/state/redux';
import { Request, Response } from 'express-serve-static-core';

export default function (req: Request, res: Response) {

	const chromeCast = useSelector((state: AppState) => state.config.chromeCast);

	chromeCast.load({ file: req.body.file });

	return res.json({
		status: 'ok',
	});

};
