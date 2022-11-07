import { Request, Response } from 'express';
import { getContent, ownerQuery, userQuery } from './data';

import { KAuthRequest } from 'types/keycloak';
import Logger from '../../functions/logger';
import { Translation } from '@prisma/client'
import { confDb } from '../../database/config';
import { deviceId } from '../../functions/system';
import { isOwner } from '../middleware/permissions';

export default async function (req: Request, res: Response) {
	const language = req.acceptsLanguages()[0] != 'undefined' 
		? req.acceptsLanguages()[0].split('-')[0] 
		: 'en';

	const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	const response: any[] = [];
	const translations: Translation[] = [];

	await confDb.translation.findMany({where: {iso31661: language}	})
		.then((data) => translations.push(...data));

	if (owner) {
		confDb.library
			.findMany(ownerQuery(req.params.id))
			.then(async (data) => {
				for (let i = 0; i < data.length; i++) {
					const l = data[i];
					response.push({
                        ...l,
                        Tv: undefined,
                        Movie: undefined,
						content: await getContent(l, translations, servers),
					});
				}
				if(req.params.id){
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
			.findFirst(userQuery(user, req.params.id))
			.then(async (data) => {
				if (!data?.Libraries) return;

				for (let i = 0; i < data?.Libraries.length; i++) {
					const l = data?.Libraries[i];
					if (!l.library) return;

					response.push({
						...l.library,
                        Tv: undefined,
                        Movie: undefined,
						content: await getContent(l.library, translations, servers),
					});
				}
				if(req.params.id){
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
