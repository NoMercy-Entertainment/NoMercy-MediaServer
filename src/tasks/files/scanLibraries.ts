import { confDb } from '../../database/config';
import { Folder, Library, LibraryFolder, Movie } from '@prisma/client'
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { TvShow } from '../../providers/tmdb/tv/index';
import { AppState, useSelector } from '../../state/redux';
import { fallbackSearch } from '../data/search';
import getFolders from './getFolders';
import { needsUpdate } from '../data/needsUpdate';
import { fullUpdate } from '../../tasks/data/fullUpdate';

export interface FolderInfo {
	id: number;
	title: string;
	year: number;
	type: string;
	folder: string;
	jsonFile: string;
	libraryId: string;
	lastCheck: number;
	lastUpdate: number;
	searchProvider: 'tmdb';
}

export const scanLibraries = async (forceUpdate: boolean = false, synchronous: boolean = false) => {
	let libs = await confDb.library.findMany({
		include: {
			folders: {
				include: {
					folder: true,
				},
			},
		},
	});

	for (const lib of libs) {
		await scan(lib, forceUpdate, synchronous);
	}
};

type Lib = (Library & {
    folders: (LibraryFolder & {
        folder: Folder | null;
    })[];
})

export const scanLibrary = async (id: string, forceUpdate: boolean = false, synchronous: boolean = false): Promise<Lib|void> => {
	await confDb.library.findFirst({
		include: {
			folders: {
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
		await scan(lib, forceUpdate, synchronous);
		return lib;
	});
};


const scan = async (lib: Lib, forceUpdate: boolean, synchronous: boolean) => {
	for (const path of lib.folders) {
		if (!path.folder?.path) return;

		if (lib.type != 'tv' && lib.type != 'movie') {
			continue;
		}

		const queue = useSelector((state: AppState) => state.config.dataWorker);
		const folders = await getFolders({ folder: path.folder?.path });

		const parsedFolders = folders.getParsedFolders();

		for (const title of parsedFolders) {
			const jsonFile = join(title.path, `${title.title}.json`);
			let x: FolderInfo;
			const updateDate = Date.now();
			
			if (existsSync(jsonFile)) {
				x = JSON.parse(readFileSync(jsonFile).toString());
				x.lastCheck = updateDate;
				x.lastUpdate = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 14)).getTime();
				// @ts-expect-error
				x.job = undefined;
			} else {
				const search = (await fallbackSearch(lib.type, title)) as TvShow | Movie;
				if (!search) continue;
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
				};
			}
			
			// @ts-expect-error
			delete x.job;
			writeFileSync(jsonFile, JSON.stringify(x, null, 4));
			if (new Date(x.lastUpdate + 1000 * 60 * 60 * 24 * 15).getTime() <= updateDate || forceUpdate || await needsUpdate(x)) {
				if(synchronous) {
					await fullUpdate(x);
				} else {
					queue.add({
						file: resolve(__dirname, '..', 'data', 'fullUpdate'),
						fn: 'fullUpdate',
						args: x,
					});
				}
			}
		}
	}
}