import { Request, Response } from 'express';
import { arch, deviceName, platform } from '../../functions/system';
import { cachePath, configPath, logPath, metadataPath, transcodesPath } from '../../state';

import Logger from '../../functions/logger';
import { ResponseStatus } from 'types/server';
import { confDb } from '../../database/config';
import osu from 'os-utils';
import path from 'path';
import { readFileSync } from 'fs';

export const serverInfo = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	const json = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), 'utf8'));

	return res.json({
		server: deviceName,
		os: platform.toTitleCase(),
		arch: arch,
		version: json.version,
		bootTime: Math.round(new Date().getTime() - osu.processUptime() * 1000),
	});
};

export const serverPaths = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	return res.json([
		{
			key: 'Cache',
			value: cachePath,
		},
		{
			key: 'Logs',
			value: logPath,
		},
		{
			key: 'Metadata',
			value: metadataPath,
		},
		{
			key: 'Transcodes',
			value: transcodesPath,
		},
		{
			key: 'Configs',
			value: configPath,
		},
	]);
};

export const serverActivity = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	confDb.activityLog
		.findMany({
			include: {
				device: true,
				user: true,
			},
			orderBy: {
				time: 'desc',
			},
		})
		.then((data) => {
			return res.json(
				data.map((d) => ({
					...d,
					user: d.user.name,
					device: d.device.title,
				}))
			);
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error getting server activities: ${error}`,
			});
			return res.json({
				status: 'error',
				message: `Something went wrong getting server activities: ${error}`,
			});
		});
};

export const devices = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	confDb.device
		.findMany({})
		.then((data) => {
			return res.json(
				data.map((d) => ({
					...d,
				}))
			);
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error getting devices: ${error}`,
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong getting devices: ${error}`,
			});
		});
};

export const metadata = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	confDb.metadata
		.findMany({})
		.then((data) => {
			return res.json(
				data.map((d) => ({
					...d,
				}))
			);
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error getting metadata: ${error}`,
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong getting metadata: ${error}`,
			});
		});
};
