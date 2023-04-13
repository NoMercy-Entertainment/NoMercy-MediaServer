import { Prisma } from '../../database/config/client';
import { CompleteTvAggregate } from './fetchTvShow';
import { downloadAndHash } from './image';

export default async (
	req: CompleteTvAggregate,
	createdByArray: Prisma.CreatorCreateOrConnectWithoutTvInput[],
	people: number[]
) => {

	for (const created_by of req.created_by) {
		if (!people.includes(created_by.id)) continue;

		createdByArray.push({
			where: {
				personId_tvId: {
					personId: created_by.id,
					tvId: req.id,
				},
			},
			create: {
				personId: created_by.id,
			},
		});

		if (created_by.profile_path) {
			await downloadAndHash({
				src: created_by.profile_path,
				table: 'person',
				column: 'profile',
				type: 'crew',
				only: ['colorPalette', 'blurHash'],
			});
		}
	}
};
