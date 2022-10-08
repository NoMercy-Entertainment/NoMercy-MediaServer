import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import { CompleteTvAggregate } from './fetchTvShow';

export default async (
	req: CompleteTvAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	createdByArray: Prisma.CastTvCreateOrConnectWithoutTvInput[],
	people: number[]
) => {

	for (const created_by of req.created_by) {
		if(!people.includes(created_by.id)) return;

		const createdInsert = Prisma.validator<Prisma.CreatorUncheckedCreateInput>()({
			creditId: created_by.credit_id,
			personId: created_by.id,
			name: created_by.name,
			gender: created_by.gender,
			profilePath: created_by.profile_path,
		});

		// transaction.push(
		await	confDb.creator.upsert({
				where: {
					creditId: created_by.credit_id,
				},
				update: createdInsert,
				create: createdInsert,
			})
		// );

		createdByArray.push({
			where: {
				creditId: created_by.credit_id,
			},
			create: {
				creditId: created_by.credit_id,
			},
		});
	}
};
