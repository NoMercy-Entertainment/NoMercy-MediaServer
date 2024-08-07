import { setUsers } from '@server/state/redux/config/actions';

import Logger from '@server/functions/logger';
import { UserResponse } from '@server/types/api';
import apiClient from '../apiClient';
import { deviceId } from '../system';
import { AppState, useSelector } from '@server/state/redux';
import { insertUser, selectUser } from '@server/db/media/actions/users';

export const getUsers = async () => {
	const moderators = useSelector((state: AppState) => state.config.moderators);

	await apiClient()
		.get<UserResponse[]>('server/users', {
			params: {
				server_id: deviceId,
			},
		})
		.then(({ data }) => {
			for (let i = 0; i < data.length; i++) {
				const user = data[i];

				insertUser({
					id: user.user_id,
					email: user.email,
					name: user.name,
					allowed: user.enabled,
					manage: moderators.some(m => m.id == user.user_id),
				});
			}

			const users = selectUser();

			setUsers(users.map((d) => {
				return {
					...d,
					created_at: new Date(d.created_at).getTime(),
					updated_at: new Date(d.created_at).getTime(),
				};
			}));

			globalThis.allowedUsers = users.map((d) => {
				return {
					...d,
					created_at: new Date(d.created_at).getTime(),
					updated_at: new Date(d.created_at).getTime(),
				};
			});

			Logger.log({
				level: 'info',
				name: 'permisson',
				color: 'magentaBright',
				message: `Users ${data.map(d => d.name).join(', ')} added to the database`,
			});
		})
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'database',
				color: 'red',
				message: error?.response?.data?.message ?? error,
			});
		});
};

export default getUsers;
