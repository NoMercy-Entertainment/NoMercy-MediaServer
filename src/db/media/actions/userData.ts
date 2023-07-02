import { InferModel, and, desc, eq, isNotNull } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { userData } from '../schema/userData';
import { Tv } from './tvs';
import { Movie } from './movies';
import { Special } from './specials';
import { User } from './users';
import { VideoFile } from './videoFiles';

export type NewUserData = InferModel<typeof userData, 'insert'>;
export const insertUserData = (data: NewUserData, constraint: Array<'tv_id' | 'movie_id' | 'special_id'>) => mediaDb.insert(userData)
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
export type UserDataWithRelations = UserData & {
	tv: Tv;
	movie: Movie;
	special: Special;
	user: User;
	videoFile: VideoFile;
};
export const selectUserData = () => {
	return mediaDb.query.userData.findMany({
		with: {
			tv: true,
			movie: true,
			special: true,
			user: true,
			videoFile: true,
		},
	}) as unknown as UserDataWithRelations[];
};

export const selectFromUserData = ({ user_id }) => {
	return mediaDb.query.userData.findMany({
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
	}) as unknown as UserDataWithRelations[];
};
