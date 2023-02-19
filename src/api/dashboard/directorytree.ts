import { execSync } from 'child_process';
import { Request, Response } from 'express';
import fs from 'fs';
import { platform } from 'os-utils';

import { sortBy } from '../../functions/stringArray';

export default function (req: Request, res: Response) {
	let path: string | string[] = req.query.path as string;
	if (platform() == 'win32') {
		path = path?.replace(/^\//u, '');
	}

	if (!path || path == null || path == undefined || path == '' || path == '/') {
		if (platform() == 'win32') {
			const wmic = execSync('powershell (Get-PSDrive).Name -match \'^[a-z]$\'').toString();
			path = wmic
				.split('\r\n')
				.filter(value => /[A-Za-z]/u.test(value))
				.filter(value => value.length == 1)
				.map(value => `${value.trim()}:/`);
		} else {
			path = '/';
		}
	}

	let array: any[] = [];

	if (Array.isArray(path)) {
		array = path.map(f => createFolderObject('', f));
	} else {
		try {
			if (!Array.isArray(path)) {
				const stats = fs.statSync(path);

				if (stats.isDirectory()) {
					if (stats.mode == 0x92) {
						return res.status(400).json({
							status: 'error',
							message: 'No permission to access this path.',
						});
					}

					const folders = fs.readdirSync(path.replace('null', '').replace('undefined', ''));

					array = sortBy(
						folders
							.filter(f => !f.includes('$'))
							.filter(f => !f.startsWith('.'))
							.map(f => createFolderObject(path, f)),
						'path',
						'asc'
					);
				}
			}
		} catch (error) {
			return res.status(400).json({
				status: 'error',
				message: 'Specified path is not a directory.',
			});
		}
	}

	if (path) {
		return res.json({
			status: 'success',
			array: array.filter(f => f != null),
		});
	}
}

const createFolderObject = function (parent, path) {
	const fullPath = parent
		? `${parent + path}/`
		: `${path}/`;

	try {
		let stats;
		if (fs.existsSync(fullPath)) {
			stats = fs.statSync(fullPath);
		} else {
			stats = fs.statSync(fullPath.replace(/[\/\\]$/u, ''));
		}

		parent = parent.replace(/[/]{1,}$/u, '').replace(/[\w.\s\d-_?,()$]*[\\/]*$/gu, '');
		if (!parent.endsWith('/')) {
			parent = '/';
		}

		return {
			path: path.match(/\w:/u)
				? path
				: `${path}/`,
			mode: stats.mode,
			size: stats.size,
			type: stats.isDirectory()
				? 'folder'
				: 'file',
			parent: parent,
			fullPath: fullPath.replace(/[/]{2,}$/u, '/'),
		};
	} catch (error) {
		//
	}
};
