import { writeFileSync } from "fs";
import { FolderInfo } from "../files/scanLibraries";
import storeMovie from "./storeMovie";
import storeTvShow from "./storeTvShow";

export const fullUpdate = async (data: FolderInfo) => {
	let fullUpdate: any = null;
	switch (data.type) {
		case 'tv':
				fullUpdate = await storeTvShow({ id: data.id, folder: data.folder, libraryId: data.libraryId });
			break;
		case 'movie':
				fullUpdate = await storeMovie({ id: data.id, folder: data.folder, libraryId: data.libraryId });
			break;
		case 'music':			
			break;	
		default:
			break;
	}

    data.lastUpdate = Date.now();
    writeFileSync(data.jsonFile, JSON.stringify(data, null, 4));
	
	return fullUpdate;
};