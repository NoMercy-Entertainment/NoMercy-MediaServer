import { InferModel, and, desc, eq, isNotNull } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { userData } from '../schema/userData';

export type NewUserData = InferModel<typeof userData, 'insert'>;
export const insertUserData = (data: NewUserData, constraint: Array<'tv_id' | 'movie_id' | 'special_id'>) => globalThis.mediaDb.insert(userData)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [userData.user_id, userData.videoFile_id, ...constraint.map(c => userData[c])],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type UserData = InferModel<typeof userData, 'select'>;
export type UserDataWithRelations = ReturnType<typeof selectUserData>;
export const selectUserData = () => {
	return globalThis.mediaDb.query.userData.findMany({
		with: {
			tv: true,
			movie: true,
			special: true,
			user: true,
			videoFile: true,
		},
	});
};

export type UserDataWithRelationsFromUser = ReturnType<typeof selectFromUserData>;
export const selectFromUserData = ({ user_id }) => {
	return globalThis.mediaDb.query.userData.findMany({
		with: {
			tv: true,
			movie: true,
			special: true,
			user: true,
			videoFile: true,
		},
		where: and(
			eq(userData.user_id, user_id),
			isNotNull(userData.time)
		),
		orderBy: desc(userData.updated_at),
	});
};
