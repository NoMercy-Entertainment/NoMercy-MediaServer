import { AbleUserParams, AddUserParams, NotificationsParams, removeUserParams, userPermissionsParams } from '@server/types/server';
import { AppState, useSelector } from '@server/state/redux';
import { Request, Response } from 'express-serve-static-core';

import Logger from '@server/functions/logger';

import { eq, inArray } from 'drizzle-orm';
import { libraries } from '@server/db/media/schema/libraries';
import { library_user } from '@server/db/media/schema/library_user';
import { insertLibraryUser } from '@server/db/media/actions/library_user';
import { insertUser, updateUser } from '@server/db/media/actions/users';
import { users } from '@server/db/media/schema/users';
import { defaultUserOptions } from '@server/state/redux/config';

export const AddUser = (req: Request, res: Response) => {
	const {
		user_id,
		email,
		name,
		enabled,
	}: AddUserParams = req.body;

	if (user_id == req.user?.sub) {
		return res.status(400)
			.json({
				status: 'error',
				message: 'You cannot add yourself.',
			});
	}


	try {

		const data = insertUser({
			id: user_id,
			email: email,
			name: name,
			allowed: enabled,
		});


		globalThis.allowedUsers = [
			...globalThis.allowedUsers.filter(u => u.id != data.id),
			{
				...defaultUserOptions,
				...data,
			},
		];

		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'User {0} added',
			args: [data.name],
		});

		const socket = useSelector((state: AppState) => state.system.socket);
		socket.emit('notify', {
			type: 'success',
			title: 'User {0} added',
			visibleOnly: true,
			duration: 2000,
			args: [data.name],
		});

		return res.json({
			status: 'ok',
			message: 'User {0} added',
			args: [data.name],
		});

	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'Error adding user {0}',
			args: [error],
		});
		return res.json({
			status: 'ok',
			message: 'Something went wrong adding user {0}',
			args: [error],
		});
	}

};

export const removeUser = (req: Request, res: Response) => {

	const { user_id }: removeUserParams = req.body;

	if (user_id == req.user?.sub) {
		return res.status(400)
			.json({
				status: 'error',
				message: 'You cannot delete yourself.',
			});
	}


	try {

		const userName = globalThis.allowedUsers.find(u => u.id == user_id)?.name;

		globalThis.mediaDb.delete(users)
			.where(eq(users.id, user_id))
			.run();

		const newAllowedUsers = [...globalThis.allowedUsers.filter(u => u.id != user_id)];
		globalThis.allowedUsers = newAllowedUsers;

		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'User {0} deleted.',
			args: [userName],
		});

		const socket = useSelector((state: AppState) => state.system.socket);
		socket.emit('notify', {
			type: 'success',
			title: 'User {0} deleted',
			visibleOnly: true,
			duration: 2000,
			args: [userName],
		});

		return res.json({
			status: 'ok',
			message: 'User {0} deleted',
			args: [userName],
		});

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'access',
			color: 'red',
			message: 'Error deleting user: {0}',
			args: [error],
		});
		return res.status(400)
			.json({
				status: 'error',
				message: 'Something went wrong deleting user: {0}',
				args: [error],
			});
	}

};

export const userPermissions = (req: Request, res: Response) => {
	const { user_id }: userPermissionsParams = req.body;
	if (user_id == req.user?.sub) {
		return res.status(400)
			.json({
				status: 'error',
				message: 'You cannot edit yourself.',
			});
	}

	try {
		const data = globalThis.mediaDb.query.users.findMany({
			where: user_id
				?				eq(users.id, user_id)
				:				undefined,
			with: {
				library_user: true,
			},
		});

		return res.json(
			data.map(d => ({
				...d,
				user_id: d.id,
				Libraries: undefined,
				libraries: d.library_user.map(f => f.library_id),
			}))
		);
	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'Error getting user permissions: {0}',
			args: [error],
		});
		return res.json({
			status: 'ok',
			message: 'Something went wrong getting permissions: {0}',
			args: [error],
		});
	}

};

export const updateUserPermissions = (req: Request, res: Response) => {
	const {
		user_id,
		enabled,
		manage,
		audioTranscoding,
		videoTranscoding,
		noTranscoding,
		libraries: libs = [],
	}: userPermissionsParams = req.body;

	if (user_id == req.user?.sub) {
		return res.status(400)
			.json({
				status: 'error',
				message: 'You cannot update yourself.',
			});
	}


	try {
		const Libs = globalThis.mediaDb.query.libraries.findMany({
			where: inArray(libraries.id, libs),
		});

		globalThis.mediaDb.delete(library_user)
			.where(eq(library_user.user_id, user_id))
			.run();

		const user = updateUser({
			id: user_id,
			allowed: enabled,
			manage: manage,
			audioTranscoding: audioTranscoding,
			videoTranscoding: videoTranscoding,
			noTranscoding: noTranscoding,
		});

		for (const libr of Libs) {
			insertLibraryUser({
				library_id: libr.id as string,
				user_id: user_id,
			});
		}

		const newAllowedUsers = [
			...globalThis.allowedUsers.filter(u => u.id != user_id),
			{
				...globalThis.allowedUsers.find(u => u.id == user_id)!,
				user_id,
				allowed: enabled,
				manage,
				audioTranscoding,
				videoTranscoding,
				noTranscoding,
			},
		];

		globalThis.allowedUsers = newAllowedUsers;

		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'User {0} permissions updated',
			args: [user.name],
		});

		return res.json({
			status: 'ok',
			message: 'Successfully updated user permissions for {0}',
			args: [user.name],
		});

	} catch (error) {
		console.log(error);
		return res.json({
			status: 'ok',
			message: 'Something went wrong updating permissions: {0}',
			args: [error],
		});
	}

};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notificationSettings = (req: Request, res: Response) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const {
		user_id,
		notificationIds,
	}: NotificationsParams = req.body;

	// await confDb.user
	// 	.update({
	// 		where: {
	// 			user_id: user_id,
	// 		},
	// 		data: {
	// 			Notifications: {
	// 				set: notificationIds.map(id => ({
	// 					notificationId_userId: {
	// 						notificationId: id,
	// 						userId: user_id,
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
	// 			message: `Notification settings updated for user: {0}.`,
	// args: [user.name]
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
	// 			message: `Error updating user notifications: {0}`,
	// args: [error],
	// 		});
	// 		return res.json({
	// 			status: 'ok',
	// 			message: `Something went wrong updating notification settings: {0}`,
	// args: [error],
	// 		});
	// 	});
};

export const AbleUser = (req: Request, res: Response) => {
	const {
		user_id,
		enabled,
	}: AbleUserParams = req.body;

	try {
		const user = updateUser({
			id: user_id,
			allowed: enabled,
		});
		globalThis.allowedUsers = [
			...globalThis.allowedUsers.filter(u => u.id != user_id),
			{
				...globalThis.allowedUsers.find(u => u.id == user_id)!,
				id: user_id,
				allowed: enabled,
			},
		];

		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'User {0} permissions updated.',
			args: [user.name],
		});

		return res.json({
			status: 'ok',
			message: 'Successfully updated user permissions for {0}',
			args: [user.name],
		});

	} catch (error) {
		return res.status(400)
			.json({
				status: 'ok',
				message: 'Something went wrong updating permissions: {0}',
				args: [error],
			});
	}

};
