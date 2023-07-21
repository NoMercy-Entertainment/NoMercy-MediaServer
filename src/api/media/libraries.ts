import { Request, Response } from 'express';

import { inArray } from 'drizzle-orm';
import { libraries } from '@server/db/media/schema/libraries';
import { getAllowedLibraries } from '@server/db/media/actions/libraries';

export default function (req: Request, res: Response) {

	const allowedLibraries = getAllowedLibraries(req);

	if (!allowedLibraries || allowedLibraries.length == 0) {
		return res.status(404).json({
			status: 'error',
			message: 'No libraries found',
		});
	}

	const data = globalThis.mediaDb.query.libraries.findMany({
		where: inArray(libraries.id, allowedLibraries),
		with: {
			folder_library: {
				with: {
					folder: true,
				},
			},
		},
	});
	return res.json(data);

}
