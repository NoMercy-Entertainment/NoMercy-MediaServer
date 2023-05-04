import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import Logger from '../../functions/logger';
import { confDb } from '../../database/config';
import { isOwner } from '../middleware/permissions';

export default function (req: Request, res: Response) {

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	const response: any[] = [];

	if (owner) {
		confDb.library
			.findMany({
				where: {
					id: req.params.id,
				},
				include: {
					Folders: {
						include: {
							folder: true,
						},
					},
				},
			})
			.then((data) => {
				for (let i = 0; i < data.length; i++) {
					const l = data[i];
					response.push(l);
				}
				if (req.params.id) {
					return res.json(response[0]);
				}
				return res.json(response);
			})
			.catch((error) => {
				Logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Error getting libraries: ${error}`,
				});
				return res.json({
					status: 'ok',
					message: `Something went wrong getting libraries: ${error}`,
				});
			});
	} else {
		confDb.user
			.findFirst({
				where: {
					sub_id: user,
				},
				include: {
					Libraries: {
						where: {
							libraryId: req.params.id,
						},
						include: {
							library: {
								include: {
									Folders: {
										include: {
											folder: true,
										},
									},
								},
							},
						},
					},
				},
			})
			.then((data) => {
				if (!data?.Libraries) return;

				for (let i = 0; i < data?.Libraries.length; i++) {
					const l = data?.Libraries[i];
					if (!l.library) return;

					response.push(l.library);
				}
				if (req.params.id) {
					return res.json(response[0]);
				}

				return res.json(response);
			})
			.catch((error) => {
				Logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Error getting libraries: ${error}`,
				});
				return res.status(404).json({
					status: 'error',
					message: `Something went wrong getting libraries: ${error}`,
				});
			});
	}
}
