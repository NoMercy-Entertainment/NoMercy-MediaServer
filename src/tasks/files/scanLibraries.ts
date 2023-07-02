import { AppState, useSelector } from '@/state/redux';
import { Movie } from '../../database/config/client';
import { FolderList, ParsedFileList } from './filenameParser';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { TvShow } from '../../providers/tmdb/tv/index';
import { cachePath } from '@/state';
import { fallbackSearch } from '../data/search';
import fullUpdate from '../../tasks/data/fullUpdate';
import getFolders from './getFolders';
import { join } from 'path';
import { needsUpdate } from '../data/needsUpdate';
import { LibraryWithRelations, selectLibrariesWithRelations, selectLibraryWithRelations } from '@/db/media/actions/libraries';
import { RunningTask, insertRunningTask } from '@/db/media/actions/runningTasks';

export interface FolderInfo {
	lib: LibraryWithRelations;
	jobsCount: number;
	id: string | number;
	title: string;
	year: number | null;
	type: string;
	folder: string;
	jsonFile: string;
	libraryId: string;
	lastCheck: number;
	lastUpdate: number;
	searchProvider: 'tmdb';
	task: RunningTask;
	index: number;
	priority: number;
}

export const scanLibraries = async (forceUpdate = false, synchronous = false) => {

	const socket = useSelector((state: AppState) => state.system.socket);

	const task = insertRunningTask({
		title: 'Scan media library',
		type: 'library',
		value: 0,
	});

	socket.emit('tasks', task);

	const jobs: {
		lib: LibraryWithRelations;
		parsedFolder?: FolderList;
		parsedFile?: ParsedFileList;
	}[] = [];

	const libs = selectLibrariesWithRelations();

	for (const lib of libs) {
		await scan(lib, jobs);
	}


	for (const title of jobs) {
		const index = jobs.indexOf(title);

		await process(
			(title.parsedFolder as FolderList ?? title.parsedFile as ParsedFileList),
			title.lib,
			forceUpdate,
			synchronous,
			jobs,
			task,
			index
		);
	}

	return libs;
};

export const scanLibrary = async (id: string, forceUpdate = false, synchronous = false) => {

	const socket = useSelector((state: AppState) => state.system.socket);

	const jobs: {
		lib: LibraryWithRelations;
		parsedFolder?: FolderList;
		parsedFile?: ParsedFileList;
	}[] = new Array<{
		lib: LibraryWithRelations;
		parsedFolder?: FolderList;
		parsedFile?: ParsedFileList;
	}>();

	const lib = selectLibraryWithRelations(id);

	if (!lib) return;
	await scan(lib, jobs);

	const task = insertRunningTask({
		title: 'Scan media library',
		type: 'library',
		value: 0,
	});

	socket.emit('tasks', task);
	console.log(jobs.length);

	for (const title of jobs) {
		const index = jobs.indexOf(title);

		await process((title.parsedFolder as FolderList ?? title.parsedFile as ParsedFileList), lib, forceUpdate, synchronous, jobs, task, index);
	}

	return lib;

};

const scan = async (lib: LibraryWithRelations, jobs: {
	lib: LibraryWithRelations;
	parsedFolder?: FolderList;
	parsedFile?: ParsedFileList;
}[]) => {
	for (const path of lib.folder_library) {
		if (!path.folder?.path) return;

		if (lib.type == 'tv' || lib.type == 'movie') {

			const folders = await getFolders({
				folder: path.folder?.path,
			});

			const parsedFolders = folders.getParsedFolders();

			for (const parsedFolder of parsedFolders) {
				if (parsedFolder.path.includes('~')) {
					continue;
				}
				jobs.push({ lib, parsedFolder });
			}

		} else if (lib.type == 'music') {

			const folders = await getFolders({
				folder: path.folder?.path,
				filter: ['mp3', 'flac'],
				ignoreBaseFilter: true,
			});

			const parsedFolders = folders.getParsedFolders();

			for (const parsedFolder of parsedFolders) {
				const folders = await getFolders({
					folder: parsedFolder?.path,
					filter: ['mp3', 'flac'],
					ignoreBaseFilter: true,
				});

				const parsedFolders2 = folders.getParsedFolders();

				for (const parsedFolder2 of parsedFolders2) {
					jobs.push({ lib, parsedFolder: parsedFolder2 });
				}
			}

		}
	}

	return lib;
};

const process = async (
	title: FolderList | ParsedFileList,
	lib: LibraryWithRelations,
	forceUpdate: boolean,
	synchronous: boolean,
	jobs: {
		lib: LibraryWithRelations;
		parsedFolder?: FolderList;
		parsedFile?: ParsedFileList;
	}[],
	task: RunningTask,
	index: number
) => {

	const jsonFile = join(cachePath, 'temp', `${title.title ?? title.name}_cache.json`);
	let x: FolderInfo;
	const updateDate = Date.now();

	if (existsSync(jsonFile)) {
		x = JSON.parse(readFileSync(jsonFile, 'utf8'));
		if (x.libraryId !== lib.id) {
			x.libraryId = lib.id!;
		}
	} else {
		const search = (await fallbackSearch(lib.type, title)) as TvShow | Movie;
		if (!search) {
			console.log(`No search result for ${title.title}`);
			return;
		}

		x = {
			id: search?.id,
			title: (search as TvShow).name ?? (search as Movie).title ?? title.title,
			year: title.year,
			folder: title.path,
			type: lib.type,
			libraryId: lib.id!,
			jsonFile: jsonFile,
			lastCheck: updateDate,
			lastUpdate: new Date('1970-01-01').getTime(),
			searchProvider: 'tmdb',
			lib: lib,
			jobsCount: jobs.length,
			task: task ?? { id: 'manual' },
			index: index,
			priority: 1,
		};
	}

	writeFileSync(jsonFile, JSON.stringify(x, null, 4));

	if (
		new Date(x.lastUpdate + 1000 * 60 * 60 * 24 * 15).getTime() <= updateDate
		|| forceUpdate
		|| (await needsUpdate(x))
	) {
		await fullUpdate(x, synchronous);
	}
};
