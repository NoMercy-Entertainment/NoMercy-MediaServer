import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { library_user } from '../schema/library_user';

export type NewLibraryUser = InferModel<typeof library_user, 'insert'>;
export const insertLibraryUser = (data: NewLibraryUser) => mediaDb.insert(library_user)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [library_user.library_id, library_user.user_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type LibraryUser = InferModel<typeof library_user, 'select'>;
export const selectLibraryUser = () => {
	return mediaDb.select()
		.from(library_user)
		.all();
};