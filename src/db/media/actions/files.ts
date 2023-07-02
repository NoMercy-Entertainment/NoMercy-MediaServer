import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@/db/helpers';
import { mediaDb } from '@/db/media';
import { files } from '../schema/files';
import { createId } from '@paralleldrive/cuid2';
import { RequireOnlyOne } from '@/types/helpers';
import { Library } from './libraries';
import { Movie } from './movies';
import { Album } from './albums';
import { Episode } from './episodes';

export type NewFile = InferModel<typeof files, 'insert'>;
export const insertFileDB = (data: NewFile) => mediaDb.insert(files)
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
export type FileWithRelations = File & { file_library: Library; file_movie: Movie; file_album: Album; file_episode: Episode; };

type SelectFile = RequireOnlyOne<{ id: string; movie_id: number, episode_id: number; seasonNumber: number; episodeNumber: number }>
export const getFilesDB = <B extends boolean>(data: SelectFile, relations?: B): B extends true ? FileWithRelations[] : File[] => {
	return mediaDb.query.files.findMany({
		with: relations
			? {
				file_library: true,
				file_movie: true,
				file_album: true,
				file_episode: true,
			}
			: {},
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	}) as unknown as B extends true ? FileWithRelations[] : File[];
};

export const getFileDB = (data: SelectFile, relations = false) => {
	return mediaDb.query.files.findFirst({
		with: relations
			? {
				file_library: true,
				file_movie: true,
				file_album: true,
				file_episode: true,
			}
			: {},
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	});
};
