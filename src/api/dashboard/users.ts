import {
	AddUserParams,
	NotificationsParams, removeUserParams,
	userPermissionsParams
} from 'types/server';
import { AppState, useSelector } from '@/state/redux';
import { Request, Response } from 'express';

import Logger from '../../functions/logger';
import { confDb } from '../../database/config';
import {
	defaultUserOptions
} from '@/state/redux/config';
import {
	setAllowedUsers
} from '@/state/redux/config/actions';
import { mediaDb } from '@/db/media';
import { eq, inArray } from 'drizzle-orm';
import { libraries } from '@/db/media/schema/libraries';
import { library_user } from '@/db/media/schema/library_user';
import { insertLibraryUser } from '@/db/media/actions/library_user';
import { Library } from '@/db/media/actions/libraries';
import { updateUser } from '@/db/media/actions/users';

export const AddUser = async (req: Request, res: Response) => {
	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);
	const { sub_id, email, name }: AddUserParams = req.body;

	await confDb.user
		.upsert({
			where: {
				sub_id: sub_id,
			},
			update: {
				sub_id: sub_id,
				email: email,
				name: name,
			},
			create: {
				sub_id: sub_id,
				email: email,
				name: name,
			},
			select: {
				name: true,
			},
		})
		.then((data) => {

			const newAllowedUsers = [
				...allowedUsers,
				{
					sub_id: sub_id,
					email: email,
					name: name,
					...defaultUserOptions,
				},
			];

			setAllowedUsers(newAllowedUsers);

			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `User ${data.name} added.`,
			});

			return res.json({
				status: 'ok',
				message: `User ${data.name} added.`,
			});
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error deleting user: ${error}`,
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong deleting user: ${error}`,
			});
		});
};

export const removeUser = async (req: Request, res: Response) => {
	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

	const { sub_id }: removeUserParams = req.body;

	await confDb.user
		.delete({
			where: {
				sub_id: sub_id,
			},
			select: {
				name: true,
			},
		})
		.then((data) => {
			const newAllowedUsers = [...allowedUsers.filter(u => u.sub_id != sub_id)];

			setAllowedUsers(newAllowedUsers);

			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `User ${data.name} deleted.`,
			});
			return res.json({
				status: 'ok',
				message: `User ${data.name} deleted.`,
			});
		})
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'access',
				color: 'red',
				message: `Error deleting user: ${error}`,
			});
			return res.json({
				status: 'error',
				message: `Something went wrong deleting user: ${error}`,
			});
		});
};

export const userPermissions = async (req: Request, res: Response) => {
	const { sub_id }: userPermissionsParams = req.body;

	sub_id
		? await confDb.user.findMany({
			where: {
				sub_id: sub_id,
			},
			include: {
				Libraries: true,
			},
		})
			.then((data) => {
				return res.json(
					data.map(d => ({
						...d,
						Libraries: undefined,
						libraries: d.Libraries.map(f => f.libraryId),
					}))
				);
			})
			.catch((error) => {
				Logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Error getting user permissions: ${error}`,
				});
				return res.json({
					status: 'ok',
					message: `Something went wrong getting permissions: ${error}`,
				});
			})
		: await confDb.user
			.findMany({
				include: {
					Libraries: true,
				},
				orderBy: {
					manage: 'desc',
				},
			})
			.then((data) => {
				return res.json(
					data.map(d => ({
						...d,
						Libraries: undefined,
						libraries: d.Libraries.map(f => f.libraryId),
					}))
				);
			})
			.catch((error) => {
				Logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Error getting user permissions: ${error}`,
				});
				return res.json({
					status: 'ok',
					message: `Something went wrong getting permissions: ${error}`,
				});
			});
};

export const updateUserPermissions = (req: Request, res: Response) => {
	const { sub_id, allowed, manage, audioTranscoding, videoTranscoding, noTranscoding, libraries: libs = [] }: userPermissionsParams = req.body;

	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

	try {
		const Libs = mediaDb.query.libraries.findMany({
			where: inArray(libraries.id, libs),
		}) as unknown as Library[];

		mediaDb.delete(library_user)
			.where(eq(library_user.user_id, sub_id))
			.run();

		updateUser({
			id: sub_id,
			allowed: allowed,
			manage: manage,
			audioTranscoding: audioTranscoding,
			videoTranscoding: videoTranscoding,
			noTranscoding: noTranscoding,
		});

		for (const libr of Libs) {
			insertLibraryUser({
				library_id: libr.id as string,
				user_id: sub_id,
			});
		}

		const newAllowedUsers = [
			...allowedUsers.filter(u => u.sub_id != sub_id),
			{
				...allowedUsers.find(u => u.sub_id == sub_id)!,
				sub_id,
				allowed,
				manage,
				audioTranscoding,
				videoTranscoding,
				noTranscoding,
			},
		];

		setAllowedUsers(newAllowedUsers);

		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `User ${sub_id} permissions updated.`,
		});

		return res.json({
			status: 'ok',
			message: `Successfully updated user permissions for ${sub_id}.`,
		});

	} catch (error) {
		console.log(error);
		return res.json({
			status: 'ok',
			message: `Something went wrong updating permissions: ${error}`,
		});
	}

};

export const notificationSettings = async (req: Request, res: Response) => {
	const { sub_id, notificationIds }: NotificationsParams = req.body;

	await confDb.user
		.update({
			where: {
				sub_id: sub_id,
			},
			data: {
				Notifications: {
					set: notificationIds.map(id => ({
						notificationId_userId: {
							notificationId: id,
							userId: sub_id,
						},
					})),
				},
			},
			select: {
				name: true,
			},
		})
		.then((data) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Notification settings updated for user: ${data.name}.`,
			});

			return res.json({
				status: 'ok',
				message: 'Successfully updated notification settings.',
			});
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error updating user notifications: ${error}`,
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong updating notification settings: ${error}`,
			});
		});
};
