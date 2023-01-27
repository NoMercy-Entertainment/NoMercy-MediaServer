import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';
import { isOwner } from '../../middleware/permissions';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

    return res.json({});

}
