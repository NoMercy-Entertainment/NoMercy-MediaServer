import { getEncoderLibraries, selectLibrariesWithRelations } from '@server/db/media/actions/libraries';
import { stat, Stats, watch } from 'fs';
import { storeMusic } from '../data/music';
import { AppState, useSelector } from '@server/state/redux';
import { resolve } from 'path';

export const watcher = () => {

	const libraries = selectLibrariesWithRelations()
		.filter(library => library.type === 'music');
	for (const library of libraries) {
		for (const lib of library.folder_library) {
			try {
				watch(lib.folder.path as string, {
					recursive: true,
					encoding: 'buffer',
				}, (event, filename) => fileChangeEvent(event, filename!.toString('utf8'), lib));
				console.log('Watching', lib.folder.path);
			} catch (error) {
				// console.error(error);
			}
		}
	}
};

const excludes = [
	'.tmp',
	'.m3u8',
	'.nfo',
	'.txt',
	'.jpg',
	'.png',
	'.jpeg',
	'.gif',
	'.bmp',
	'.db',
	'.ini',
];

const fileChangeEvent = (event: string, filename: string, lib: { folder: { path: any; }; }) => {

	for (const exclude of excludes) {
		if (filename.endsWith(exclude)) return Buffer.from('');
	}

	const path = `${lib.folder.path}\\${filename}`;
	if (event === 'change') {
		stat(path, (err, stat) => {
			if (err) return Buffer.from('');

			if (stat.isFile()) {
				handleFileChange(path, stat);
			} else {
				handleDirectoryChange(path, stat);
			}
		});
	} else if (event === 'rename') {
		stat(path, (err, stat) => {
			if (err) return Buffer.from('');

			console.log(path, stat);
		});
	}
	return Buffer.from('');

};

interface Change {
	type: string;
	folder: string;
	path: string;
	modTime: number;
	size: number;
}

const changes: Change[] = [];

let timeout: NodeJS.Timeout;

const handleFileChange = (path: string, stat: Stats) => {

	const modTime = stat.mtimeMs;
	const size = stat.size;

	console.log('File changed:', path);

	const folder = path.match(/.+[\/\\]/u)?.[0];

	if (changes.some(change => change.folder === folder)) {
		clearTimeout(timeout);
	}


	const change = {
		type: 'file',
		folder: folder as string,
		path: path,
		modTime,
		size,
	};

	changes.push(change);

	timeout = setTimeout(() => {
		const queue = useSelector((state: AppState) => state.config.queueWorker);
		queue.add({
			file: resolve(__filename),
			fn: 'processFile',
			args: change,
		});

		for (const c of changes) {
			if (c.folder === change.folder) {
				changes.splice(changes.indexOf(c), 1);
			}
		}
	}, 1000 * 60 * 0.1);
};

export const handleDirectoryChange = (path: string, stat: Stats) => {

	const modTime = stat.mtimeMs;
	const size = stat.size;

	console.log('Directory changed:', path, modTime, size);

};

export const processFile = async (change: Change) => {
	const libraries = await getEncoderLibraries();

	const library = libraries.find((library) => {
		return library.folder_library.some((lib) => {
			return change.path.startsWith(lib.folder.path as string);
		});
	});

	console.log('Processing', change.folder);

	switch (library?.type) {
	case 'tv':
		// await storeTvShow({ id: data.id as number, folder: change.folder, libraryId: library?.id as string, task: { id: 'file change' } });
		break;
	case 'movie':
		// await storeMovie({ id: data.id as number, folder: change.folder, libraryId: library?.id as string, task: { id: 'file change' } });
		break;
	case 'music':
		await storeMusic({
			folder: change.folder,
			libraryId: library?.id as string,
			task: { id: 'file change' },
		});
		break;
	default:
		break;
	}
};
