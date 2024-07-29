import { InferModel } from 'drizzle-orm';

import { folder_library } from '../schema/folder_library';

export type NewFolderLibrary = InferModel<typeof folder_library, 'insert'>;
export const insertLibraryFolder = (data: NewFolderLibrary) => {
	return globalThis.mediaDb.insert(folder_library)
		.values(data)
		.onConflictDoUpdate({
			target: [folder_library.library_id, folder_library.folder_id],
			set: data,
		})
		.returning()
		.get();
};

export type FolderLibrary = InferModel<typeof folder_library, 'select'>;
export const selectLibraryFolder = () => {
	return globalThis.mediaDb.select()
		.from(folder_library)
		.all();
};
