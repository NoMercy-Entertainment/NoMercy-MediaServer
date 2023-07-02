import { ConfigData } from 'types/server';
// import { confDb } from '../../database/config';
import loadConfigs from '../loadConfigs';
import { insertConfiguration } from '@/db/media/actions/configuration';

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
