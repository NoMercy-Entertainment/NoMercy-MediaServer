import { Request, Response } from 'express-serve-static-core';

import { AppState, useSelector } from '@server/state/redux';

export default function (req: Request, res: Response) {
	const { id }: {id: string, type: string} = req.body;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const socket = useSelector((state: AppState) => state.system.socket);

	if (!id) {
		return res.status(400).json({
			success: false,
			message: 'You need to specify an id',
		});

	}

	// const where = type == 'tv'
	// 	? {
	// 		tvId: parseInt(id, 10),
	// 	}
	// 	: {
	// 		movieId: parseInt(id, 10),
	// 	};

	// const userDatas = await confDb.userData.findMany({
	// 	where: {
	// 		...where,
	// 		sub_id: req.user.sub,
	// 		NOT: {
	// 			time: null,
	// 		},
	// 	},
	// 	select: {
	// 		id: true,
	// 	},
	// });

	// confDb.userData.deleteMany({
	// 	where: {
	// 		id: {
	// 			in: userDatas.map(u => u.id),
	// 		},
	// 	},
	// })
	// 	.then((data) => {
	// 		socket.emit('update_content', ['continue']);
	// 		return res.json({
	// 			success: true,
	// 			data: data,
	// 			message: 'Item removed from watched',
	// 		});
	// 	})
	// 	.catch((error) => {
	// 		return res.status(400).json({
	// 			success: true,
	// 			error: error,
	// 			message: 'Failed to remove item from watched',
	// 		});
	// 	});

}
