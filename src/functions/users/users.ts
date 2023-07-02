import { setAllowedUsers, setUsers } from '@/state/redux/config/actions';

import Logger from '../../functions/logger';
import { UserResponse } from 'types/api';
import axios from '../axios';
import { deviceId } from '../system';
import { AppState, useSelector } from '@/state/redux';
import { insertUser, selectUser } from '@/db/media/actions/users';

export const getUsers = async () => {
	// const transaction: Prisma.PromiseReturnType<any>[] = [];
	const moderators = useSelector((state: AppState) => state.config.moderators);

	await axios()
		.get<UserResponse[]>('https://api.nomercy.tv/server/users', {
			params: {
				server_id: deviceId,
			},
		})
		.then(({ data }) => {
			for (let i = 0; i < data.length; i++) {
				const user = data[i];

				insertUser({
					id: user.sub_id,
					email: user.email,
					name: user.name,
					allowed: user.enabled,
					manage: moderators.some(m => m.id == user.sub_id),
				});

			}

			const users = selectUser();

			setUsers(users.map((d) => {
				return {
					...d,
					created_at: new Date(d.created_at),
					updated_at: new Date(d.created_at),
				};
			}));

			setAllowedUsers(users.map((d) => {
				return {
					...d,
					created_at: new Date(d.created_at).getTime(),
					updated_at: new Date(d.created_at).getTime(),
				};
			}));

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
