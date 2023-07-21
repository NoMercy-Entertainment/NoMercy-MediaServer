import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@server/db/media';
import { convertBooleans } from '@server/db/helpers';
import { library_tv } from '../schema/library_tv';

export type NewLibraryTv = InferModel<typeof library_tv, 'insert'>;
export const insertLibraryTv = (data: NewLibraryTv) => mediaDb.insert(library_tv)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [library_tv.library_id, library_tv.tv_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type LibraryTv = InferModel<typeof library_tv, 'select'>;
export const selectLibraryTv = () => {
	return mediaDb.select()
		.from(library_tv)
		.all();
};
