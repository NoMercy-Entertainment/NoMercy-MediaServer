import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { AppState, useSelector } from '../../state/redux';
import { FolderInfo } from '../files/scanLibraries';
import storeMovie from './storeMovie';
import { storeMusic } from './storeMusic';
import storeTvShow from './storeTvShow';

// import { confDb } from '../../database/config';


export const exec = async (data: FolderInfo) => {

	switch (data.type) {
	case 'tv':
		await storeTvShow({ id: data.id as number, folder: data.folder, libraryId: data.libraryId });
		break;
	case 'movie':
		await storeMovie({ id: data.id as number, folder: data.folder, libraryId: data.libraryId });
		break;
	case 'music':
		await storeMusic({ id: data.id as string, folder: data.folder, libraryId: data.libraryId });
		break;
	default:
		break;
	}

	data.lastUpdate = Date.now();
	writeFileSync(data.jsonFile, JSON.stringify(data, null, 4));

	return data;
};

export default async function (x: FolderInfo, synchronous = false) {

	// const runningTask = await confDb.runningTask.update({
	// 	where: {
	// 		id: x.task.id,
	// 	},
	// 	data: {
	// 		title: `Scanning ${x.lib.title} library`,
	// 		type: 'library',
	// 		value: Math.ceil((x.index / x.jobsCount) * 100),
	// 	},
	// }).catch(e => console.log(e));

	if (synchronous) {
		await exec(x);
		return;
	}

	const queue = useSelector((state: AppState) => state.config.queueWorker);
	await queue.add({
		file: resolve(__filename),
		fn: 'exec',
		args: x,
	});

	// const socket = useSelector((state: AppState) => state.system.socket);
	// socket.emit('tasks', runningTask);
}
