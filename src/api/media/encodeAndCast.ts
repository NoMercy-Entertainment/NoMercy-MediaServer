import { Request, Response } from 'express';

import { AppState, useSelector } from '../../state/redux';

export default (req: Request, res: Response) => {

	const chromeCast = useSelector((state: AppState) => state.config.chromeCast);

	chromeCast.load({ file: req.body.file });

	return res.json({
		status: 'ok',
	});

};
