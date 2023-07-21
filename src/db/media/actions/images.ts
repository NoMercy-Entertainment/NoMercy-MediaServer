
import { InferModel } from 'drizzle-orm';
import { images } from '../schema/images';
import { convertBooleans } from '@server/db/helpers';
import { RequireOnlyOne } from '@server/types/helpers';

export type NewImage = InferModel<typeof images, 'insert'>;
export const insertImage = (data: NewImage) => globalThis.mediaDb.insert(images)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [images.filePath],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Images = ReturnType<typeof selectImages>;

type SelectImage = RequireOnlyOne<{ id: number; filePath: string }>
export const selectImages = (data: SelectImage) => {
	return globalThis.mediaDb.query.images.findMany({
		with: {
		},
		where: (images, { eq }) => eq(images[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	});
};
export type Image = ReturnType<typeof selectImages>;
export const selectImage = (data: SelectImage) => {
	return globalThis.mediaDb.query.images.findFirst({
		with: {
		},
		where: (images, { eq }) => eq(images[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	});
};
