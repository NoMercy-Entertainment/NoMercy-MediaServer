import { Request, Response } from 'express';

import { execSync } from 'child_process';
import { ParsedShow, filenameParse } from '@/functions/videoFilenameParser';
import fs from 'fs';
import { join } from 'path';
import { platform } from 'os-utils';
import { matchPercentage, sortBy } from '../../functions/stringArray';
import { confDb } from '@/database/config';
import { Episode, Movie } from '@/database/config/client';
import { createMediaFolder, createTitleSort } from '@/tasks/files/filenameParser';
import { searchMovie, searchTv } from '@/providers/tmdb/search';

import { movie as fetchMovie } from '../../providers/tmdb/movie';
import { tv as fetchTv } from '../../providers/tmdb/tv';

import storeMovie from '../../tasks/data/storeMovie';
import Logger from '@/functions/logger/logger';
import storeTvShow from '@/tasks/data/storeTvShow';
import i18next from 'i18next';

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

		parent = parent.replace(/[/]{1,}$/u, '').replace(/[\w.\s\d\-_?,()$]*[\\\/]*$/gu, '');
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

const extensions = [
	'.webm',
	'.mkv',
	'.flv',
	'.vob',
	'.ogv',
	'.ogg',
	'.rrc',
	'.gifv',
	'.mng',
	'.mov',
	'.avi',
	'.qt',
	'.wmv',
	'.yuv',
	'.rm',
	'.asf',
	'.amv',
	'.mp4',
	'.m4p',
	'.m4v',
	'.mpg',
	'.mp2',
	'.mpeg',
	'.mpe',
	'.mpv',
	'.m4v',
	'.svi',
	'.3gp',
	'.3g2',
	'.mxf',
	'.roq',
	'.nsv',
	'.flv',
	'.f4v',
	'.f4p',
	'.f4a',
	'.f4b',
	'.mod',
];

export const fileList = async (req: Request, res: Response) => {
	const folder = req.body.folder as string;
	const type = req.body.type as string;

	if (!folder || folder == null || folder == undefined || folder == '' || folder == '/') {
		return res.status(400).json({
			status: 'error',
			message: 'No path specified.',
		});
	}

	try {
		const stats = fs.statSync(folder);

		if (stats.isDirectory()) {
			if (stats.mode == 0x92) {
				return res.status(400).json({
					status: 'error',
					message: 'No permission to access this path.',
				});
			}

			const files = fs.readdirSync(folder.replace('null', '').replace('undefined', ''))
				?.filter(f => !f.includes('$'))
				.filter(f => !f.startsWith('.'))
				.filter(f => extensions.includes(`.${f.split('.').at(-1)}`)) ?? [];

			const response: any = [];
			for (const file of files) {
				response.push(await createFileObject(folder, file, type));
			}

			return res.json({
				status: 'success',
				files: response.filter(f => !!f.parsed?.title),
			});
		}
	} catch (error) {
		return res.status(400).json({
			status: 'error',
			message: 'Specified path is not a directory.',
		});
	}
};

const createFileObject = async (parent: string, path: string, type: string) => {
	const fullPath = join(parent, path);
	const stats = fs.statSync(fullPath);
	const parsed = filenameParse(path, type == 'tv') as ParsedShow;

	const library = await confDb.library
		.findFirst({
			where: {
				type: type,
			},
			include: {
				Folders: {
					include: {
						folder: true,
					},
				},
			},
		}).catch(e => console.log(e));

	if (!library?.id) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'Library not found',
		});
		return {
			status: 'error',
			message: 'Library not found',
		};
	}

	let episode: Episode | null = <Episode>{};
	if (type == 'tv' && parsed.title != null && parsed.seasons?.[0] != null && parsed.episodeNumbers?.[0] != null) {
		episode = await confDb.episode.findFirst({
			where: {
				seasonNumber: parsed.seasons[0],
				episodeNumber: parsed.episodeNumbers[0],
				Tv: {
					titleSort: createTitleSort(parsed.title),
				},
			},
		});
		if (!episode) {

			let currentScore = 0;
			const searchResult = await searchTv(parsed.title, parsed.year ?? undefined)
				.then((tvs) => {
					let show = tvs[0];

					if (tvs.length == 1) {
						return show;
					}

					for (const tv of tvs) {
						const newScore = matchPercentage(tv.name, parsed.title);
						if (newScore > currentScore) {
							currentScore = newScore;
							show = tv;
						}
					}

					return show;
				})
				.catch(() => null);

			if (searchResult) {
				episode = await confDb.episode.findFirst({
					where: {
						seasonNumber: parsed.seasons[0],
						episodeNumber: parsed.episodeNumbers[0],
						Tv: {
							titleSort: createTitleSort(searchResult.name, searchResult.first_air_date),
						},
					},
				});
				if (!episode) {
					i18next.changeLanguage('en');
					const tvData = await fetchTv(searchResult.id);

					await storeTvShow({
						id: tvData.id,
						folder: createMediaFolder(library, tvData),
						libraryId: library.id,
					}).then(async (response) => {
						if (!response?.data) return;

						episode = await confDb.episode.findFirst({
							where: {
								seasonNumber: parsed.seasons[0],
								episodeNumber: parsed.episodeNumbers[0],
								Tv: {
									titleSort: createTitleSort(searchResult.name, searchResult.first_air_date),
								},
							},
						});
					});

				}
			}
		}
	}

	let movie: Movie | null = <Movie>{};
	if (type == 'movie' && parsed.title != null) {
		movie = await confDb.movie.findFirst({
			where: {
				titleSort: createTitleSort(parsed.title, parsed.year ?? undefined),
			},
		});
		if (!movie) {
			let currentScore = 0;
			i18next.changeLanguage('en');
			const searchResult = await searchMovie(parsed.title, parsed.year)
				.then((movies) => {
					let show = movies[0];

					if (movies.length == 1) {
						return show;
					}

					for (const movie of movies) {
						const newScore = matchPercentage(movie.title, parsed.title);
						if (newScore > currentScore) {
							currentScore = newScore;
							show = movie;
						}
					}
					return show;
				});
			if (searchResult) {
				movie = await confDb.movie.findFirst({
					where: {
						titleSort: createTitleSort(searchResult.title, searchResult.release_date),
					},
				});
				if (!movie) {

					const movieData = await fetchMovie(searchResult.id);

					await storeMovie({
						id: movieData.id,
						folder: createMediaFolder(library, movieData),
						libraryId: library.id,
					}).then(async (response) => {
						if (!response?.data) return;

						movie = await confDb.movie.findFirst({
							where: {
								titleSort: createTitleSort(response.data.title, response.data.release_date),
							},
						});
					});
				}
			}
		}
	}

	return {
		name: path,
		parsed: parsed,
		match: episode?.id
			? episode
			: movie?.id
				? movie
				: null,
		path: fullPath,
		mode: stats.mode,
		size: stats.size,
		type: stats.isDirectory()
			? 'folder'
			: 'file',
		parent: parent,
		extension: path.match(/\.[0-9a-z]+$/u),
	};
};
