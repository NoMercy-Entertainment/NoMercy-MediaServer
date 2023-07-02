import { Request, Response } from 'express';
import { appendFileSync, writeFileSync } from 'fs';

writeFileSync('tv.json', '[');
export default (req: Request, res: Response) => {

	console.log(req.body);
	appendFileSync('tv.json', JSON.stringify(req.body));

	return res.json({});

};
