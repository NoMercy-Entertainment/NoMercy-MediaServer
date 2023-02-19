import { CompleteTvAggregate } from './fetchTvShow';
import { Prisma } from '../../database/config/client';
import { confDb } from '../../database/config';

export default (
	req: CompleteTvAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	createdByArray: Prisma.CastTvCreateOrConnectWithoutTvInput[],
	people: number[]
) => {

	for (const created_by of req.created_by) {
		if (!people.includes(created_by.id)) continue;

		const createdInsert = Prisma.validator<Prisma.CreatorUncheckedCreateInput>()({
			creditId: created_by.credit_id,
			personId: created_by.id,
			name: created_by.name,
			gender: created_by.gender,
			profilePath: created_by.profile_path,
		});

		transaction.push(
			confDb.creator.upsert({
				where: {
					creditId: created_by.credit_id,
				},
				update: createdInsert,
				create: createdInsert,
			})
		);

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
