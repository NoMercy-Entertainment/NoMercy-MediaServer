import { Request, Response } from 'express-serve-static-core';
import { readFile, writeFileSync } from 'fs';

export default (req: Request, res: Response) => {

	console.log(req.body);

	const fileName = 'music.json';
	readFile(fileName, (err, data) => {
		const arr = JSON.parse(data?.toString() ?? '[]');
		arr.push(req.body);
		writeFileSync(fileName, JSON.stringify(arr, null, 2));
	});
	return res.status(418).json({
		//
	});

};
