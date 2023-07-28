import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { folders } from '../schema/folders';

export type NewFolder = InferModel<typeof folders, 'insert'>;
export const insertFolder = (data: NewFolder) => globalThis.mediaDb.insert(folders)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [folders.id],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Folder = InferModel<typeof folders, 'select'>;
export const findFoldersDB = () => {
	return globalThis.mediaDb.select()
		.from(folders)
		.all();
};
export const findFoldersDBWithLibraries = () => {
	return globalThis.mediaDb.query.folders.findMany({
		with: {
			folder_library: true,
		},
	});
};
