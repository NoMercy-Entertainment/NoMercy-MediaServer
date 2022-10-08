import { Prisma } from '@prisma/client'
import { ConfigData } from 'types/server';
import { confDb } from '../../database/config';
import { commitConfigTransaction } from '../../database';
import loadConfigs from '../loadConfigs';

export default async (data: ConfigData, user: string | null, transaction?: Prisma.PromiseReturnType<any>[]) => {
	let hasTransaction = !!transaction;
	if (!transaction) {
		transaction = [];
	}

	for (const [key, value] of Object.entries(data)) {
		if (key == 'owner') {
			continue;
		}
		transaction.push(
			confDb.configuration.upsert({
				where: {
					key: key.toString(),
				},
				update: user
					? {
							key: key.toString(),
							value: JSON.stringify(value)?.replace(/^"|"$/gu, ''),
							modified_by: user,
					  }
					: {
							key: key.toString(),
							value: JSON.stringify(value)?.replace(/^"|"$/gu, ''),
							modified_by: null,
					  },
				create: {
					key: key.toString(),
					value: JSON.stringify(value)?.replace(/^"|"$/gu, ''),
				},
			})
		);
	}

	if (!hasTransaction) {
		await commitConfigTransaction(transaction);
		await loadConfigs();
	}
};
