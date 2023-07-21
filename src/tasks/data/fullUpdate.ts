import { AppState, useSelector } from '@server/state/redux';

import { FolderInfo } from '../files/scanLibraries';
import { resolve } from 'path';
import storeMovie from './movie';
import { storeMusic } from './music';
import storeTvShow from './tv';
import { writeFileSync } from 'fs';

export const exec = async (data: FolderInfo) => {

	switch (data.type) {
	case 'tv':
		await storeTvShow({ id: data.id as number, folder: data.folder, libraryId: data.libraryId });
		break;
	case 'movie':
		await storeMovie({ id: data.id as number, folder: data.folder, libraryId: data.libraryId });
		break;
	case 'music':
		await storeMusic({ folder: data.folder, libraryId: data.libraryId });
		break;
	default:
		break;
	}

	data.lastUpdate = Date.now();
	writeFileSync(data.jsonFile, JSON.stringify(data, null, 4));

	return data;
};

export default async function (x: FolderInfo, synchronous = false) {

	if (synchronous) {
		await exec(x);
		return;
	}

	const queue = useSelector((state: AppState) => state.config.queueWorker);
	queue.add({
		file: resolve(__filename),
		fn: 'exec',
		args: x,
	});
}
