import {
	AddUserParams,
	NotificationsParams, removeUserParams,
	userPermissionsParams
} from '@server/types/server';
import { AppState, useSelector } from '@server/state/redux';
import { Request, Response } from 'express';

import Logger from '@server/functions/logger';
import {
	setAllowedUsers
} from '@server/state/redux/config/actions';
import { mediaDb } from '@server/db/media';
import { eq, inArray } from 'drizzle-orm';
import { libraries } from '@server/db/media/schema/libraries';
import { library_user } from '@server/db/media/schema/library_user';
import { insertLibraryUser } from '@server/db/media/actions/library_user';
import { insertUser, updateUser } from '@server/db/media/actions/users';
import { users } from '@server/db/media/schema/users';
import { defaultUserOptions } from '@server/state/redux/config';

export const AddUser = (req: Request, res: Response) => {
	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);
	const { sub_id, email, name }: AddUserParams = req.body;

	try {

		const data = insertUser({
			id: sub_id,
			email: email,
			name: name,
		});


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

		const socket = useSelector((state: AppState) => state.system.socket);
		socket.emit('update_content', []);

		return res.json({
			status: 'ok',
			message: `User ${data.name} added.`,
		});

	} catch (error) {
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
	}

};

export const removeUser = (req: Request, res: Response) => {
	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

	const { sub_id }: removeUserParams = req.body;

	try {

		mediaDb.delete(library_user)
			.where(eq(library_user.user_id, sub_id))
			.run();

		mediaDb.delete(users)
			.where(eq(users.id, sub_id))
			.run();

		const newAllowedUsers = [...allowedUsers.filter(u => u.sub_id != sub_id)];

		setAllowedUsers(newAllowedUsers);

		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `User ${sub_id} deleted.`,
		});
		return res.json({
			status: 'ok',
			message: `User ${sub_id} deleted.`,
		});

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'access',
			color: 'red',
			message: `Error deleting user: ${error}`,
		});
		return res.status(400).json({
			status: 'error',
			message: `Something went wrong deleting user: ${error}`,
		});
	}

};

export const userPermissions = (req: Request, res: Response) => {
	const { sub_id }: userPermissionsParams = req.body;

	try {
		const data = mediaDb.query.users.findMany({
			where: sub_id
				? eq(users.id, sub_id)
				: undefined,
			with: {
				library_user: true,
			},
		});

		return res.json(
			data.map(d => ({
				...d,
				Libraries: undefined,
				libraries: d.library_user.map(f => f.library_id),
			}))
		);
	} catch (error) {
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
	}

	// sub_id
	// 	? await confDb.user.findMany({
	// 		where: {
	// 			sub_id: sub_id,
	// 		},
	// 		include: {
	// 			Libraries: true,
	// 		},
	// 	})
	// 		.then((data) => {
	// 			return res.json(
	// 				data.map(d => ({
	// 					...d,
	// 					Libraries: undefined,
	// 					libraries: d.Libraries.map(f => f.libraryId),
	// 				}))
	// 			);
	// 		})
	// 		.catch((error) => {
	// 			Logger.log({
	// 				level: 'info',
	// 				name: 'access',
	// 				color: 'magentaBright',
	// 				message: `Error getting user permissions: ${error}`,
	// 			});
	// 			return res.json({
	// 				status: 'ok',
	// 				message: `Something went wrong getting permissions: ${error}`,
	// 			});
	// 		})
	// 	: await confDb.user
	// 		.findMany({
	// 			include: {
	// 				Libraries: true,
	// 			},
	// 			orderBy: {
	// 				manage: 'desc',
	// 			},
	// 		})
	// 		.then((data) => {
	// 			return res.json(
	// 				data.map(d => ({
	// 					...d,
	// 					Libraries: undefined,
	// 					libraries: d.Libraries.map(f => f.libraryId),
	// 				}))
	// 			);
	// 		})
	// 		.catch((error) => {
	// 			Logger.log({
	// 				level: 'info',
	// 				name: 'access',
	// 				color: 'magentaBright',
	// 				message: `Error getting user permissions: ${error}`,
	// 			});
	// 			return res.json({
	// 				status: 'ok',
	// 				message: `Something went wrong getting permissions: ${error}`,
	// 			});
	// 		});
};

export const updateUserPermissions = (req: Request, res: Response) => {
	const { sub_id, allowed, manage, audioTranscoding, videoTranscoding, noTranscoding, libraries: libs = [] }: userPermissionsParams = req.body;

	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

	try {
		const Libs = mediaDb.query.libraries.findMany({
			where: inArray(libraries.id, libs),
		});

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

export const notificationSettings = (req: Request, res: Response) => {
	const { sub_id, notificationIds }: NotificationsParams = req.body;

	// await confDb.user
	// 	.update({
	// 		where: {
	// 			sub_id: sub_id,
	// 		},
	// 		data: {
	// 			Notifications: {
	// 				set: notificationIds.map(id => ({
	// 					notificationId_userId: {
	// 						notificationId: id,
	// 						userId: sub_id,
	// 					},
	// 				})),
	// 			},
	// 		},
	// 		select: {
	// 			name: true,
	// 		},
	// 	})
	// 	.then((data) => {
	// 		Logger.log({
	// 			level: 'info',
	// 			name: 'access',
	// 			color: 'magentaBright',
	// 			message: `Notification settings updated for user: ${data.name}.`,
	// 		});

	// 		return res.json({
	// 			status: 'ok',
	// 			message: 'Successfully updated notification settings.',
	// 		});
	// 	})
	// 	.catch((error) => {
	// 		Logger.log({
	// 			level: 'info',
	// 			name: 'access',
	// 			color: 'magentaBright',
	// 			message: `Error updating user notifications: ${error}`,
	// 		});
	// 		return res.json({
	// 			status: 'ok',
	// 			message: `Something went wrong updating notification settings: ${error}`,
	// 		});
	// 	});
};
