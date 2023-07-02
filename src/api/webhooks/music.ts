import { Request, Response } from 'express';
import { appendFileSync, writeFileSync } from 'fs';

writeFileSync('music.json', '[');
export default (req: Request, res: Response) => {

	console.log(req.body);
	appendFileSync('music.json', JSON.stringify(req.body));

	return res.json({});

};
