import { mkdirSync } from 'fs';
import { applicationPaths } from '../../state/';

const createAppFolders = () => {
	for (let i = 0; i < Object.values(applicationPaths).length; i++) {
		const path = Object.values(applicationPaths)[i];
		mkdirSync(path, { recursive: true });
	}
};

export default createAppFolders;
