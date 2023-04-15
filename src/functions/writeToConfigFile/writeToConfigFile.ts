import { existsSync, readFileSync, writeFileSync } from 'fs';

import { configFile } from '@/state';

export default (key: string, val: any) => {
	if (!existsSync(configFile)) {
		writeFileSync(configFile, JSON.stringify({}));
	}

	const data = JSON.parse(readFileSync(configFile, 'utf8'));

	data[key] = val;

	writeFileSync(configFile, JSON.stringify(data));
};
