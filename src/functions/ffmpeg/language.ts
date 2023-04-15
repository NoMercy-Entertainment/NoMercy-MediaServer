import { dataPath } from '@/state';
import { join } from 'path';
import { readFileSync } from 'fs';

export const isoToName = function (iso: string) {
	const data = JSON.parse(readFileSync(join(dataPath, 'languages.json'), 'utf-8'));

	const name = data.filter(n => n.iso_639_2_b == iso);

	if (!name[0]) return 'und';

	return name[0].english_name;
};

export default {
	isoToName,
};
