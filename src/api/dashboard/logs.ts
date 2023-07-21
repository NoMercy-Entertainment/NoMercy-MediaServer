import { Request, Response } from 'express';
import { logLevels, logNames, winstonLog } from '@server/state';

import Logger from '@server/functions/logger';
import winston from 'winston';
import { writeFileSync } from 'fs';

export const logs = (req: Request, res: Response) => {

	const { from, until, limit, start, order, level, name, message, user } = req.body;

	const options: winston.QueryOptions = {
		// @ts-ignore
		from: from ?? new Date() - 24 * 60 * 60 * 1000,
		until: until ?? new Date(),
		limit: limit ?? 1000,
		start: start ?? 0,
		order: order ?? 'desc',
		fields: ['name', 'message', 'level', 'timestamp', 'user'],
	};

	try {
		Logger.query(options, (err, results) => {

			if (!results || !Array.isArray(results?.file)) {
				return res.json([]);
			}

			const filteredResults = results.file.map((r, index) => ({ ...r, id: index, user: r.user ?? '' }))
				.filter(r => !r.message?.includes('/api/dashboard/manage/logs') ?? true)
				.filter(r => (level
					? r.level.includes(level)
					: true))
				.filter(r => (name?.length > 0
					? name.includes(r.name)
					: true))
				.filter(r => (message == ''
					? true
					: r.message.toLowerCase().includes(message.toLowerCase())))
				.filter(r => (user
					? r.user?.includes(user) ?? false
					: true));

			if (!req.isOwner) {
				return res.json(filteredResults.filter(r => r.name == 'permisson'));
			}

			return res.json(filteredResults);
		});

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'access',
			color: 'magentaBright',
			message: 'Error fetching logs',
		});
		return res.json({
			status: 'error',
			message: `Something went wrong fetching logs: ${error}`,
		});
	}
};

export const deleteLogs = (req: Request, res: Response) => {

	try {
		writeFileSync(winstonLog, '');

		Logger.log({
			level: 'info',
			name: 'app',
			color: 'magentaBright',
			user: req.user.name,
			message: 'Cleared the logs',
		});

		return res.json({
			status: 'ok',
			message: 'Logs have been deleted',
		});

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'system',
			color: 'red',
			message: 'Error deleting logs',
		});
		return res.json({
			status: 'error',
			message: `Something went wrong deleting logs: ${error}`,
		});
	}
};

export const logOptions = (req: Request, res: Response) => {

	return res.json({
		logLevels: logLevels,
		logNames: logNames,
	});
};
