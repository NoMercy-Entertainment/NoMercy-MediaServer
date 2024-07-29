import { Request, Response } from 'express-serve-static-core';
import { exec, execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'fs';

import { transcodesPath } from '@server/state';

export default function (req: Request, res: Response) {
	const { id } = req.params;

	try {
		const url = `https://www.youtube.com/watch?v=${id}`;
		const basePath = `${transcodesPath}/${id}/`;

		const cmd = [
			'yt-dlp',
			`"${url}"`,
			'-f "bv[vcodec^=avc1]+ba[acodec^=mp4a]"',
			'--write-auto-subs',
			'--write-subs',
			'--sub-format vtt',
			'-o "subtitle:%(id)s.%(ext)s"',
			'-o -',
			'|',
			'ffmpeg',
			'-i pipe:',
			'-c:v copy',
			'-c:a copy',
			'-n',
			'-f segment',
			'-segment_time 4',
			'-segment_list_type m3u8',
			`-segment_list "${basePath}video.m3u8"`,
			`"${basePath}video-%04d.ts"`,
		].join(' ');

		console.log(cmd);

		if (!existsSync(`${basePath}video.m3u8`)) {

			execSync(`yt-dlp -F "${url}"`);

			mkdirSync(`${basePath}`, { recursive: true });

			exec(cmd, { cwd: `${basePath}` });

			while (!existsSync(`${basePath}video.m3u8`)) {
				//
			}
		}

		const textTracks = readdirSync(`${basePath}`)
			.filter(f => f.endsWith('vtt'))
			.map(f => `/transcodes/${id}/${f}`);

		res.status(201).json({
			key: id,
			path: `/transcodes/${id}/video.m3u8`,
			textTracks,
			command: cmd,
		});
	} catch (error) {
		res.status(404).json({
			status: 'error',
			error: error,
		});
	}
}

export const deleteTrailer = (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		rmSync(`${transcodesPath}/${id}`, { recursive: true });

		res.json({
			status: 'success',
			message: 'Tailer deleted',
		});
	} catch (error) {
		res.json({
			status: 'error',
			error,
		});
	}
};
