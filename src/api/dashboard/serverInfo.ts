import { Request, Response } from 'express';
import { arch, platform, version } from '@server/functions/system';
import { cachePath, configPath, logPath, metadataPath, transcodesPath } from '@server/state';

import Logger from '@server/functions/logger';
import nosu from 'node-os-utils';
import osu from 'os-utils';
import path from 'path';
import { readFileSync } from 'fs';
import { AppState, useSelector } from '@server/state/redux';
import { mediaDb } from '@server/db/media';
import { desc } from 'drizzle-orm';
import { activityLogs } from '@server/db/media/schema/activityLogs';
import { devices } from '@server/db/media/schema/devices';
import { metadata } from '@server/db/media/schema/metadata';

export const serverInfo = async (req: Request, res: Response) => {
	const deviceName = useSelector((state: AppState) => state.config.deviceName);
	const json = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), 'utf8'));
	const cpu = await nosu.cpu;

	return res.json({
		server: deviceName,
		cpu: cpu.model().replace(/\s{2,}/gu, ''),
		os: `${platform.toTitleCase()} ${version}`,
		arch: arch,
		version: json.version,
		bootTime: Math.round(new Date().getTime() - osu.processUptime() * 1000),
	});
};

export const serverPaths = (req: Request, res: Response) => {
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

export const serverActivity = (req: Request, res: Response) => {
	try {
		const data = mediaDb.query.activityLogs
			.findMany({
				with: {
					device: true,
					user: true,
				},
				orderBy: desc(activityLogs.time),
			});

		return res.json(
			data.map(d => ({
				...d,
				user: d.user.name,
				device: d.device.name,
			}))
		);
	} catch (error) {
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

	}
};

export const device = (req: Request, res: Response) => {
	try {
		const data = mediaDb.select().from(devices)
			.all();

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
			message: `Error getting devices: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting devices: ${error}`,
		});
	}
};

export const metadatas = (req: Request, res: Response) => {
	try {
		const data = mediaDb.select()
			.from(metadata)
			.all();
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
			message: `Error getting metadata: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting metadata: ${error}`,
		});

	}

};
