import { AppState, useSelector } from '@server/state/redux';

import Logger from '@server/functions/logger';
import { binariesPath } from '@server/state';
import { fileLastModified } from '../dateTime';
import fs from 'fs';
import path from 'path';
import request from 'request';
import unzipper from 'unzipper';

export default async () => {
	const downloads = useSelector((state: AppState) => state.config.downloads);
	for (let i = 0; i < downloads.length; i++) {
		const program = downloads[i];

		const name = path.basename(program.url);

		if (fileLastModified(program.name) > 7) {
			Logger.log({
				level: 'info',
				name: 'setup',
				color: 'blueBright',
				message: `Downloading: ${program.name}`,
			});

			await new Promise<void>(async (resolve, reject) => {
				try {
					await request.head(program.url, () => {
						request(program.url).pipe(
							fs.createWriteStream(`${binariesPath}/../${name}`).on('finish', async () => {
								if (fs.existsSync(`${binariesPath}/../${name}`)) {
									Logger.log({
										level: 'info',
										name: 'setup',
										color: 'blueBright',
										message: `Unpacking: ${program.name} to: ${binariesPath}/../${name}`,
									});

									try {

										const buffer = fs.readFileSync(`${binariesPath}/../${name}`);
										const directory = await unzipper.Open.buffer(buffer);

										let folders = directory.files.filter(f => f.type === 'Directory');
										let files = directory.files.filter(f => f.type === 'File');

										if (program.filter) {
											folders = directory.files.filter(f => f.type === 'Directory').filter(f => f.path.includes(program.filter));
											files = directory.files
												.filter(f => f.type === 'File')
												.filter(f => f.path.includes(program.filter))
												.map((f) => {
													return {
														...f,
														path: f.path.replace(/.*\//u, ''),
													};
												});
										}

										for (const f of folders) {
											fs.mkdirSync(`${binariesPath}/../${program.path}/${f.path}`, {
												recursive: true,
											});
										}

										for (const f of files) {
											const content = await f.buffer();

											if (!fs.existsSync(`${binariesPath}/../${program.path}/${f.path}`.replace(/\/[\w\d\s_\.()-]+$/u, ''))) {
												fs.mkdirSync(`${binariesPath}/../${program.path}/${f.path}`.replace(/\/[\w\d\s_\.()-]+$/u, ''), { recursive: true });
											}

											fs.writeFileSync(`${binariesPath}/../${program.path}/${f.path}`, content);
											fs.chmodSync(`${binariesPath}/../${program.path}/${f.path}`, 711);
										}

										try {
											fs.rmSync(`${binariesPath}/../${name}`);
										} catch (error) {
										//
										}
									} catch (error) {
										//
									}

									resolve();
								}
							})
						);
					});
				} catch (e) {
					reject(e);
				}
			});
		}
	}
};
