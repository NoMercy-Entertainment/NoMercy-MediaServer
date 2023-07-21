import { ConfigData } from '@server/types/server';
import loadConfigs from '../loadConfigs';
import { insertConfiguration } from '@server/db/media/actions/configuration';

export default async (data: ConfigData, user: string | null) => {

	for (const [key, value] of Object.entries(data)) {
		if (key == 'owner') {
			continue;
		}
		insertConfiguration({
			key: key.toString(),
			value: JSON.stringify(value)?.replace(/^"|"$/gu, ''),
			modified_by: user,
		});

	}

	await loadConfigs();

};
