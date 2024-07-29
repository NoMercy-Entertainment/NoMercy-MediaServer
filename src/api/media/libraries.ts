import { Request, Response } from 'express-serve-static-core';

import { asc, inArray } from 'drizzle-orm';
import { libraries } from '@server/db/media/schema/libraries';
import { getAllowedLibraries } from '@server/db/media/actions/libraries';

export default function(req: Request, res: Response) {

	const allowedLibraries = getAllowedLibraries(req);

	if (!allowedLibraries || allowedLibraries.length == 0) {
		return res.json([]);
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
		orderBy: asc(libraries.order),
	});

	return res.json({ data });

}
