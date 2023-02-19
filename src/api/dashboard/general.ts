import { confDb } from '../../database/config';
import Logger from '../../functions/logger';
import { Request, Response } from 'express';
import { ResponseStatus } from 'types/server';

export const languages = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	await confDb.language
		.findMany({
			orderBy: {
				english_name: 'asc',
			},
		})
		.then((data) => {
			return res.json(
				data.map(d => ({
					...d,
				}))
			);
		})
		.catch((error) => {
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
		});
};

export const countries = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	await confDb.country
		.findMany({
			orderBy: {
				english_name: 'asc',
			},
		})
		.then((data) => {
			return res.json(
				data.map(d => ({
					...d,
				}))
			);
		})
		.catch((error) => {
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
		});
};
