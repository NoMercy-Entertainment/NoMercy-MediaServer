import { setAllowedUsers, setUsers } from '../../state/redux/config/actions';

import Logger from '../../functions/logger';
import { Prisma } from '@prisma/client'
import { UserResponse } from 'types/api';
import axios from '../axios';
import { commitConfigTransaction } from '../../database';
import { confDb } from '../../database/config';
import { deviceId } from '../system';

export const getUsers = async () => {
	const transaction: Prisma.PromiseReturnType<any>[] = [];
	await axios()
		.get<UserResponse[]>('https://api.nomercy.tv/server/users', {
			params: {
				server_id: deviceId,
			},
		})
		.then(async ({ data }) => {
			for (let i = 0; i < data.length; i++) {
				const user = data[i];
				transaction.push(
					confDb.user.upsert({
						where: {
							sub_id: user.sub_id,
						},
						update: {
							sub_id: user.sub_id,
							email: user.email,
							name: user.name,
							allowed: user.enabled,
						},
						create: {
							sub_id: user.sub_id,
							email: user.email,
							name: user.name,
						},
					})
				);
			}
			await commitConfigTransaction(transaction);

			const users = await confDb.user.findMany();
			setUsers(users);

			const newAllowedUsers = [...users].map((d) => {
				return {
					...d,
					created_at: new Date(d.created_at).getTime(),
					updated_at: new Date(d.created_at).getTime(),
				};
			});
			
			setAllowedUsers(newAllowedUsers);

			Logger.log({
				level: 'info',
				name: 'permisson',
				color: 'magentaBright',
				message: 'Users ' + data.map((d) => d.name).join(', ') + ' added to the database',
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
