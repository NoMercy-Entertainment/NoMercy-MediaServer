import { FolderInfo } from "../files/scanLibraries";
import { confDb } from "../../database/config";
import storeMovie from "./storeMovie";
import { storeMusic } from "./storeMusic";
import storeTvShow from "./storeTvShow";
import { writeFileSync } from "fs";

export const fullUpdate = async (data: FolderInfo) => {
	let fullUpdate: any = null;
	
	try {
		await confDb.runningTask.update({
			where: {
				id: data.task.id
			},
			data: {
				title: `Scanning ${data.lib.title} library`,
				type: 'library',
				value: Math.ceil((data.index / data.jobsCount) * 100),
			}
		});
		
	} catch (error) {
		
	}
	
	switch (data.type) {
		case 'tv':
				fullUpdate = await storeTvShow({ id: data.id as number, folder: data.folder, libraryId: data.libraryId, task: data.task });
			break;
		case 'movie':
				fullUpdate = await storeMovie({ id: data.id as number, folder: data.folder, libraryId: data.libraryId, task: data.task });
			break;
		case 'music':
				fullUpdate = await storeMusic({ id: data.id as string, folder: data.folder, libraryId: data.libraryId, task: data.task });
			break;	
		default:
			break;
	}

    data.lastUpdate = Date.now();
    writeFileSync(data.jsonFile, JSON.stringify(data, null, 4));
	
	return data;
};