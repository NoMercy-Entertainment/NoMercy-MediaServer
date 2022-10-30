import { LibraryFolder } from '@prisma/client';
import { confDb } from './config';

export interface LibraryWithFolders {
	id: string;
	autoRefreshInterval: string;
	chapterImages: boolean;
	extractChapters: boolean;
	extractChaptersDuring: boolean;
	image: string | null;
	perfectSubtitleMatch: boolean;
	realtime: boolean;
	specialSeasonName: string;
	title: string;
	type: string;
	country: string;
	language: string;
	created_at: Date | null;
	updated_at: Date | null;
	folders: Folder[];
}
interface Folder {
	id: string;
	path: string;
	created_at: Date | null;
	updated_at: Date | null;
}

export const getLibrariesWithFolders = async (): Promise<LibraryWithFolders[]> => {
	const libraryDB = await confDb.library.findMany({
		include: {
			Folders: {
				include: {
					folder: true,
				},
			},
		},
	});
	const libraries = libraryDB.map((l) => {
		return {
			...l,
			folders: l.Folders.map((f) => f.folder!) ?? [],
		};
	});
	return libraries;
};


export interface DBLibraryWithFolders {
	Folders: (LibraryFolder & {
		folder: Folder | null;
	})[];
}
