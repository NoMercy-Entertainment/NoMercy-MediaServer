import {
	Folder,
	Library,
	LibraryFolder,
	Movie,
} from '@prisma/client';
import {
	existsSync,
	readFileSync, writeFileSync
} from 'fs';
import { join, resolve } from 'path';

import getFolders from './getFolders';
import { AppState, useSelector } from '../../state/redux';
import {
	FolderList,
	ParsedFileList,
} from './filenameParser';
import { TvShow } from '../../providers/tmdb/tv/index';
import { confDb } from '../../database/config';
import { fallbackSearch } from '../data/search';
import { needsUpdate } from '../data/needsUpdate';
import { cachePath } from '../../state';
import { fullUpdate } from '../../tasks/data/fullUpdate';

export interface FolderInfo {
	lib: Lib;
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
	task: {
		id: string
	}, 
	index: number; 
	priority: number; 
}

export const scanLibraries = async (forceUpdate: boolean = false, synchronous: boolean = false) => {

	const socket = useSelector((state: AppState) => state.system.socket);

	const task = await confDb.runningTask.create({
		data: {
			title: 'Scan media library',
			type: 'library',
			value: 0,
		},
		select: {
			id: true,
		}
	});
	
	socket.emit('tasks', task);
	
	const jobs: { 
		lib: Lib; 
		parsedFolder?: FolderList; 
		parsedFile?: ParsedFileList;
	}[] = [];

	let libs = await confDb.library.findMany({
		include: {
			Folders: {
				include: {
					folder: true,
				},
			},
		},
	});

	for (const lib of libs) {
		await scan(lib, jobs);
	}
	

	for (const title of jobs) {
		const index = jobs.indexOf(title);

		await process((title.parsedFolder as FolderList ?? title.parsedFile as ParsedFileList), title.lib, forceUpdate, synchronous, jobs, task, index);
	}

	return libs;
};

type Lib = (Library & {
    Folders: (LibraryFolder & {
        folder: Folder | null;
    })[];
})


export const scanLibrary = async (id: string, forceUpdate: boolean = false, synchronous: boolean = false): Promise<Lib|void> => {

	const socket = useSelector((state: AppState) => state.system.socket);

	const jobs: { 
		lib: Lib; 
		parsedFolder?: FolderList; 
		parsedFile?: ParsedFileList;
	}[] = new Array<{ 
		lib: Lib; 
		parsedFolder?: FolderList; 
		parsedFile?: ParsedFileList;
	}>;

	const lib = await confDb.library.findFirst({
		include: {
			Folders: {
				include: {
					folder: true,
				},
			},
		},
		where: {
			id: id,
		}
	})
	.then(async (lib) => {
		if(!lib) return;
		await scan(lib, jobs);
		return lib;
	});

	const task = await confDb.runningTask.create({
		data: {
			title: 'Scan media library',
			type: 'library',
			value: 0,
		},
		select: {
			id: true,
		}
	});

	socket.emit('tasks', task);
	console.log(jobs.length);
	
	for (const title of jobs) {
		const index = jobs.indexOf(title);

		await process((title.parsedFolder as FolderList ?? title.parsedFile as ParsedFileList), lib!, forceUpdate, synchronous, jobs, task, index);
	}

	return lib;

};

const scan = async (lib: Lib, jobs: { 
	lib: Lib; 
	parsedFolder?: FolderList; 
	parsedFile?: ParsedFileList;
}[]): Promise<Lib|undefined> => {

	for (const path of lib.Folders) {
		if (!path.folder?.path) return;

		if (lib.type == 'tv' || lib.type == 'movie') {

			const folders = await getFolders({ 
				folder: path.folder?.path 
			});

			const parsedFolders = folders.getParsedFolders();
			
			for (const parsedFolder of parsedFolders) {
				if(parsedFolder.path.includes('~')){
					continue;
				}
				jobs.push({lib, parsedFolder});
			}

		}
		else if (lib.type == 'music') {

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
					jobs.push({lib, parsedFolder: parsedFolder2});
				}
			}

		}
	}

	return lib;
}

const process = async (
	title: FolderList | ParsedFileList, 
	lib: Lib, 
	forceUpdate: boolean, 
	synchronous: boolean, 
	jobs: { 
		lib: Lib; 
		parsedFolder?: FolderList; 
		parsedFile?: ParsedFileList;
	}[], 
	task: {id: string}, 
	index: number
) => {

	const queue = useSelector((state: AppState) => state.config.queueWorker);
	const socket = useSelector((state: AppState) => state.system.socket);

	const jsonFile = join(cachePath, 'temp', `${title.title ?? title.name}_cache.json`);
	let x: FolderInfo;
	const updateDate = Date.now();
	
	if (existsSync(jsonFile)) {
		x = JSON.parse(readFileSync(jsonFile, 'utf8'));
		x.lastCheck = updateDate;
		x.lastUpdate = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 14)).getTime();
		// @ts-expect-error
		x.job = undefined;
		x.lib = lib;
		x.jobsCount = jobs.length;
		x.task = task ?? {id: 'manual'};
		x.index = index;
		x.priority = 1;
	} else {
		const search = (await fallbackSearch(lib.type, title)) as TvShow | Movie;
		if (!search) {
			console.log(title);
			return
		};
		x = {
			id: search?.id,
			title: (search as TvShow).name ?? (search as Movie).title ?? title.title,
			year: title.year,
			folder: title.path,
			type: lib.type,
			libraryId: lib.id,
			jsonFile: jsonFile,
			lastCheck: updateDate,
			lastUpdate: new Date('1970-01-01').getTime(),
			searchProvider: 'tmdb',
			lib: lib,
			jobsCount: jobs.length,
			task: task ?? {id: 'manual'}, 
			index: index,
			priority: 1,
		};
	};
	
	// @ts-expect-error
	delete x.job;
	writeFileSync(jsonFile, JSON.stringify(x, null, 4));
	if (
		new Date(x.lastUpdate + 1000 * 60 * 60 * 24 * 15).getTime() <= updateDate || 
		forceUpdate || 
		await needsUpdate(x)
	) {
		if(synchronous) {
		
			const runningTask = await confDb.runningTask.update({
				where: {
					id: task.id
				},
				data: {
					title: `Scanning ${lib.title} library`,
					type: 'library',
					value: Math.ceil((index / x.jobsCount) * 100),
				}
			}).catch(e => console.log(e));

			await fullUpdate(x);
			
			socket.emit('tasks', runningTask);

		} else {
			// await fullUpdate(x);
			await queue.add({
				file: resolve(__dirname, '..', 'data', 'fullUpdate'),
				fn: 'fullUpdate',
				args: x,
			});
		}
	}
}