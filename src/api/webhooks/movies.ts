import { Request, Response } from 'express';
import { appendFileSync, writeFileSync } from 'fs';

writeFileSync('movies.json', '[');
export default (req: Request, res: Response) => {

	console.log(req.body);
	appendFileSync('movies.json', JSON.stringify(req.body));

	return res.json({});

};
