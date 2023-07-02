
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { images } from '../schema/images';
import { convertBooleans } from '@/db/helpers';
import { RequireOnlyOne } from '@/types/helpers';
import { Person } from './people';
import { Crew } from './crews';
import { Cast } from './casts';

export type NewImage = InferModel<typeof images, 'insert'>;
export const insertImage = (data: NewImage) => mediaDb.insert(images)
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

export type Image = InferModel<typeof images, 'select'>;
export type ImageWithRelations = Image & { image_cast: Cast; image_crew: Crew; image_person: Person; };

type SelectImage = RequireOnlyOne<{ id: number; filePath: string }>
export const selectImages = <B extends boolean>(data: SelectImage, relations?: B): B extends true ? ImageWithRelations[] : Image[] => {
	return mediaDb.query.images.findMany({
		with: relations
			? {
				image_cast: true,
				image_crew: true,
				image_person: true,
			}
			: {},
		where: (images, { eq }) => eq(images[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	}) as unknown as B extends true ? ImageWithRelations[] : Image[];
};
export const selectImage = <B extends boolean>(data: SelectImage, relations?: B): B extends true ? ImageWithRelations : Image => {
	return mediaDb.query.images.findFirst({
		with: relations
			? {
				image_cast: true,
				image_crew: true,
				image_person: true,
			}
			: {},
		where: (images, { eq }) => eq(images[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	}) as unknown as B extends true ? ImageWithRelations : Image;
};
