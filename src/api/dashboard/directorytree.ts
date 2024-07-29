import { Request, Response } from 'express-serve-static-core';

import { execSync } from 'child_process';
import { filenameParse, ParsedShow, parseTitleAndYear } from '@server/functions/videoFilenameParser';
import fs from 'fs';
import { join } from 'path';
import { platform } from 'os-utils';
import { matchPercentage, sortBy } from '@server/functions/stringArray';
import { createMediaFolder, createTitleSort } from '@server/tasks/files/filenameParser';
import { searchMovie, searchTv } from '@server/providers/tmdb/search';

import { movie as fetchMovie } from '@server/providers/tmdb/movie';
import { tv as fetchTv } from '@server/providers/tmdb/tv';

import storeMovie from '@server/tasks/data/movie';
import Logger from '@server/functions/logger/logger';
import storeTvShow from '@server/tasks/data/tv';
import i18next from 'i18next';
import { and, eq } from 'drizzle-orm';
import { Episode } from '@server/db/media/actions/episodes';
import { episodes } from '@server/db/media/schema/episodes';
import { tvs } from '@server/db/media/schema/tvs';
import { Movie } from '@server/db/media/actions/movies';
import { movies } from '@server/db/media/schema/movies';
import { getEncoderLibraryByType } from '@server/db/media/actions/libraries';
import { libraries } from '@server/db/media/schema/libraries';

export default function(req: Request, res: Response) {
	let path: string | string[] = req.body.path ?? req.body.folder as string;
	if (typeof path == 'string' && platform() == 'win32') {
		path = path?.replace(/^\//u, '');
	}

	if (!path || path == null || path == undefined || path == '' || path == '/') {
		if (platform() == 'win32') {
			const wmic = execSync('powershell (Get-PSDrive).Name -match \'^[a-z]$\'')
				.toString();
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
						return res.status(400)
							.json({
								status: 'error',
								message: 'No permission to access this path.',
							});
					}

					const folders = fs.readdirSync(path.replace('null', '')
						.replace('undefined', ''));
					// console.log(folders);

					array = sortBy(
						folders
							.filter(f => !f.includes('$'))
							.filter(f => !f.startsWith('.'))
							.map(f => createFolderObject(path as string, f)),
						'path',
						'asc'
					);
				}
			}
		} catch (error) {
			console.log(error);
			return res.status(400)
				.json({
					status: 'error',
					message: error,
				});
		}
	}

	if (path) {
		return res.json({
			status: 'success',
			data: array.filter(f => f != null),
		});
	}
}

const createFolderObject = function(parent: string, path: string) {
	const fullPath = parent
		?		`${parent + path}/`
		:		`${path}/`;

	try {
		let stats;
		if (fs.existsSync(fullPath)) {
			stats = fs.statSync(fullPath);
		} else {
			stats = fs.statSync(fullPath.replace(/[\/\\]$/u, ''));
		}

		parent = parent.replace(/[/]{1,}$/u, '')
			.replace(/[\w.\s\d\-_?,()$]*[\\\/]*$/gu, '');
		if (!parent.endsWith('/')) {
			parent = '/';
		}

		return {
			path: path.match(/\w:/u)
				?				path
				:				`${path}/`,
			mode: stats.mode,
			size: stats.size,
			type: stats.isDirectory()
				?				'folder'
				:				'file',
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
	const libraryId = req.body.libraryId as string;

	await i18next.changeLanguage('en');

	if (!folder || folder == null || folder == undefined || folder == '' || folder == '/') {
		return res.status(400)
			.json({
				status: 'error',
				message: 'No path specified.',
			});
	}

	try {
		const stats = fs.statSync(folder);

		if (stats.isDirectory()) {
			if (stats.mode == 0x92) {
				return res.status(400)
					.json({
						status: 'error',
						message: 'No permission to access this path.',
					});
			}

			const files = fs.readdirSync(folder.replace('null', '')
				.replace('undefined', ''))
				?.filter(f => !f.includes('$'))
				.filter(f => !f.startsWith('.'))
				.filter(f => extensions.includes(`.${f.split('.')
					.at(-1)}`)) ?? [];

			const response: FileObject[] = [];
			for (const file of files) {
				response.push(await createFileObject(folder, file, type, libraryId));
			}

			return res.json({
				status: 'success',
				files: response.filter(f => !!f.parsed?.title)
					.sort((a, b) =>
						(a.match?.id && b.match?.id
							?							a.match?.id - b.match?.id
							:							a.parsed.title.localeCompare(b.parsed.title))),
			});
		}
	} catch (error) {
		return res.status(400)
			.json({
				status: 'error',
				message: error,
			});
	}
};

interface FileObject {
	name: string;
	parsed: ParsedShow;
	match: Episode | Movie | null;
	path: string;
	mode: number;
	size: number;
	type: 'folder' | 'file';
	parent: string;
	extension: RegExpMatchArray | null;
}

const createFileObject = async (parent: string, path: string, type: string, libraryId: string): Promise<FileObject> => {
	const fullPath = join(parent, path);
	const stats = fs.statSync(fullPath);
	const parsed = filenameParse(path, type == 'tv') as ParsedShow;

	// console.log(parsed);

	if (!parsed.year) {
		const {
			year,
		} = parseTitleAndYear(fullPath);
		if (year) {
			parsed.year = parseInt(year, 10);
		}
	}

	// const socket = useSelector((state: AppState) => state.system.socket);

	let library = globalThis.mediaDb.query.libraries.findFirst({
		where: eq(libraries.id, libraryId),
		with: {
			folder_library: {
				with: {
					folder: true,
				},
			},
			encoderProfile_library: {
				with: {
					encoderProfile: true,
				},
			},
		},
	});

	if (!library?.id) {
		library = getEncoderLibraryByType(type);
	}

	if (!library?.id) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'Library not found',
		});
		return {
			// @ts-ignore
			status: 'error',
			message: 'Library not found',
		};
	}

	let episode: Episode | undefined = <Episode>{};
	if (type == 'tv' && parsed.title != null && parsed.episodeNumbers?.[0] != null) {
		episode = globalThis.mediaDb.query.tvs.findFirst({
			where: eq(tvs.titleSort, createTitleSort(parsed.title, parsed.year)),
			with: {
				episodes: {
					where: and(
						eq(episodes.seasonNumber, parsed.seasons[0] ?? 1),
						eq(episodes.episodeNumber, parsed.episodeNumbers[0])
					),
				},
			},
		})?.episodes?.[0];

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

				console.log({
					id: searchResult.id,
					name: searchResult.name,
					titleSort: createTitleSort(searchResult.name, parsed.year),
					season: parsed.seasons[0] ?? 1,
					episode: parsed.episodeNumbers[0],
				});

				episode = globalThis.mediaDb.query.tvs.findFirst({
					where: eq(tvs.id, searchResult.id),
					with: {
						episodes: {
							where: and(
								eq(episodes.seasonNumber, parsed.seasons[0] ?? 1),
								eq(episodes.episodeNumber, parsed.episodeNumbers[0])
							),
						},
					},
				})?.episodes?.[0];

				console.log(episode);

				if (!episode) {
					// socket.emit('notify', {
					// 	title: `One moment, we're fetching ${searchResult.name} from TMDB.`,
					// 	type: NotificationType.INFO,
					// } as NotificationProps);

					await i18next.changeLanguage('en');
					const tvData = await fetchTv(searchResult.id);

					await storeTvShow({
						id: tvData.id,
						folder: createMediaFolder(library!, tvData),
						libraryId: library.id,
					})
						.then(() => {
							episode = globalThis.mediaDb.query.tvs.findFirst({
								where: eq(tvs.id, tvData.id),
								with: {
									episodes: {
										where: and(
											eq(episodes.seasonNumber, parsed.seasons[0] ?? 1),
											eq(episodes.episodeNumber, parsed.episodeNumbers[0])
										),
									},
								},
							})?.episodes?.[0];
						});

				}
			}
		}
	}

	let movie: Movie | undefined = <Movie>{};
	if (type == 'movie' && parsed.title != null) {

		movie = globalThis.mediaDb.query.movies.findFirst({
			where: eq(movies.titleSort, createTitleSort(parsed.title, parsed.year)),
		});

		if (!movie) {
			// socket.emit('notify', {
			// 	title: `One moment, we're fetching ${parsed.title} from TMDB.`,
			// 	type: NotificationType.INFO,
			// } as NotificationProps);
			let currentScore = 0;
			await i18next.changeLanguage('en');
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

				movie = globalThis.mediaDb.query.movies.findFirst({
					where: eq(movies.titleSort, createTitleSort(parsed.title, parsed.year)),
				});

				if (!movie) {

					const movieData = await fetchMovie(searchResult.id);

					await storeMovie({
						id: movieData.id,
						folder: createMediaFolder(library!, movieData),
						libraryId: library.id,
					})
						.then(() => {
							movie = globalThis.mediaDb.query.movies.findFirst({
								where: eq(movies.id, movieData.id),
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
			?			episode
			:			movie?.id
				?				movie
				:				null,
		path: fullPath,
		mode: stats.mode,
		size: stats.size,
		type: stats.isDirectory()
			?			'folder'
			:			'file',
		parent: parent,
		extension: path.match(/\.[0-9a-z]+$/u),
	};
};
