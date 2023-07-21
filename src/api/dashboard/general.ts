import { mediaDb } from '@server/db/media';
import Logger from '@server/functions/logger';
import { Request, Response } from 'express';
import { asc } from 'drizzle-orm';
import { languages } from '@server/db/media/schema/languages';

export const language = (req: Request, res: Response) => {

	try {
		const data = mediaDb.query.languages.findMany({
			orderBy: asc(languages.english_name),
		});
		return res.json(
			data.map(d => ({
				...d,
			}))
		);
	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `Error getting languages: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting languages: ${error}`,
		});
	}
};

export const countries = (req: Request, res: Response) => {

	try {
		const data = mediaDb.query.countries.findMany({
			orderBy: asc(languages.english_name),
		});
		return res.json(
			data.map(d => ({
				...d,
			}))
		);
	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `Error getting countries: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting countries: ${error}`,
		});
	}
};
