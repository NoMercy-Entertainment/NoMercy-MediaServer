import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { files } from '../schema/files';
import { createId } from '@paralleldrive/cuid2';
import { RequireOnlyOne } from '@server/types/helpers';

export type NewFile = InferModel<typeof files, 'insert'>;
export const insertFileDB = (data: NewFile) => globalThis.mediaDb.insert(files)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: files.path,
		set: {
			...convertBooleans(data),
			id: data.id ?? undefined,
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type File = InferModel<typeof files, 'select'>;
export type FilesWithRelations = ReturnType<typeof getFilesDB>;

type SelectFile = RequireOnlyOne<{ id: string; movie_id: number, episode_id: number; seasonNumber: number; episodeNumber: number }>
export const getFilesDB = (data: SelectFile) => {
	return globalThis.mediaDb.query.files.findMany({
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	});
};

export type FileWithRelations = ReturnType<typeof getFileDB>;
export const getFileDB = (data: SelectFile) => {
	return globalThis.mediaDb.query.files.findFirst({
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	});
};
