

import browsers from './browsers';
import { existsSync } from 'fs';

function getInstalledBrowsers () {
	let hasBrowser = false;
	for (const browser of Object.values(browsers)) {
		const list = browser.DEFAULT_CMD[process.platform];
		for (const path of list ?? []) {
			if (existsSync(path)) {
				hasBrowser = true;
				break;
			}
		}
	}
	return hasBrowser;
}

export default getInstalledBrowsers;
