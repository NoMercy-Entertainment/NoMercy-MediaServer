import { applicationPaths, configFile, tokenFile } from '../../state/';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const createAppFolders = () => {
	for (let i = 0; i < Object.values(applicationPaths).length; i++) {
		const path = Object.values(applicationPaths)[i];
		mkdirSync(path, { recursive: true });
	}
	if(!existsSync(tokenFile)){
		writeFileSync(tokenFile, JSON.stringify({}));
	}
	if(!existsSync(configFile)){
		writeFileSync(configFile, JSON.stringify({}));
	}
};

export default createAppFolders;
