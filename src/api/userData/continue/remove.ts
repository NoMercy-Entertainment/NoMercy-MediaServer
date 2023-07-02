import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { AppState, useSelector } from '@/state/redux';

export default async function (req: Request, res: Response) {
	const user = (req as unknown as KAuthRequest).token.content.sub;
	const { id, type }: {id: string, type: string} = req.body;
	const socket = useSelector((state: AppState) => state.system.socket);

	if (!id) {
		return res.status(400).json({
			success: false,
			message: 'You need to specify an id',
		});

	}

	const where = type == 'tv'
		? {
			tvId: parseInt(id, 10),
		}
		: {
			movieId: parseInt(id, 10),
		};

	const userDatas = await confDb.userData.findMany({
		where: {
			...where,
			sub_id: user,
			NOT: {
				time: null,
			},
		},
		select: {
			id: true,
		},
	});

	confDb.userData.deleteMany({
		where: {
			id: {
				in: userDatas.map(u => u.id),
			},
		},
	})
		.then((data) => {
			socket.emit('update_content', ['continue']);
			return res.json({
				success: true,
				data: data,
				message: 'Item removed from watched',
			});
		})
		.catch((error) => {
			return res.status(400).json({
				success: true,
				error: error,
				message: 'Failed to remove item from watched',
			});
		});

}
