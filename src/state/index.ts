import { appPath, executableSuffix } from '../functions/system';

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

export const userName = process.env.USERNAME;

export const cachePath = path.resolve(appPath, 'cache');
export const apiCachePath = path.resolve(appPath, 'cache', 'apiData');
export const imagesPath = path.resolve(cachePath, 'images');
export const omdbPath = path.resolve(cachePath, 'omdb');
export const tempPath = path.resolve(cachePath, 'temp');
export const transcodesPath = path.resolve(cachePath, 'transcodes');
export const configPath = path.resolve(appPath, 'config');
export const dataPath = path.resolve(appPath, 'data');
export const collectionsPath = path.resolve(dataPath, 'collections');
export const playlistsPath = path.resolve(dataPath, 'playlists');
export const userDataPath = path.resolve(dataPath, 'userData');
export const ScheduledTasksPath = path.resolve(dataPath, 'ScheduledTasks');
export const subtitlesPath = path.resolve(dataPath, 'subtitles');
export const logPath = path.resolve(appPath, 'log');
export const metadataPath = path.resolve(appPath, 'metadata');
export const libraryPath = path.resolve(metadataPath, 'library');
export const peoplePath = path.resolve(metadataPath, 'people');
export const viewsPath = path.resolve(metadataPath, 'views');
export const pluginsPath = path.resolve(appPath, 'plugins');
export const pluginConfigPath = path.resolve(pluginsPath, 'configurations');
export const rootPath = path.resolve(appPath, 'root');
export const certPath = path.resolve(rootPath, 'certs');
export const binariesPath = path.resolve(rootPath, 'binaries');
export const publicPath = path.join(__dirname, '..', 'public');

export const applicationPaths = {
	appPath,
	binariesPath,
	cachePath,
	apiCachePath,
	certPath,
	collectionsPath,
	configPath,
	dataPath,
	userDataPath,
	imagesPath,
	libraryPath,
	logPath,
	metadataPath,
	omdbPath,
	peoplePath,
	playlistsPath,
	pluginConfigPath,
	pluginsPath,
	publicPath,
	rootPath,
	ScheduledTasksPath,
	subtitlesPath,
	tempPath,
	transcodesPath,
	viewsPath,
};

export const tokenFile = path.resolve(configPath, 'token.json');
export const configFile = path.resolve(configPath, 'config.json');
export const errorLog = path.resolve(logPath, `errorLog-${new Date().toISOString()
	.split('T')[0].replace(/-/gu, '')}.txt`);
export const winstonLog = path.join(logPath, `serverLog-${new Date().toISOString()
	.split('T')[0].replace(/-/gu, '')}.log`);
export const winstonRejectionLog = path.join(logPath, `rejectionLog-${new Date().toISOString()
	.split('T')[0].replace(/-/gu, '')}.log`);

export const mediaDbFile = path.resolve(dataPath, 'media.db');
export const queueDbFile = path.resolve(dataPath, 'queue.db');

export const sslCA = path.resolve(certPath, 'ca.pem');
export const sslCert = path.resolve(certPath, 'cert.pem');
export const sslKey = path.resolve(certPath, 'key.pem');

export const ffmpeg = path.resolve(binariesPath, `ffmpeg${executableSuffix}`);
export const ffprobe = path.resolve(binariesPath, `ffprobe${executableSuffix}`);

export const fingerprintCalc = path.resolve(binariesPath, `fpcalc${executableSuffix}`);

export const languagesFile = path.resolve(dataPath, 'languages.json');

export const makeMkv = path
	.resolve(process.platform == 'win32'
		// eslint-disable-next-line no-template-curly-in-string
		? execSync('powershell ${env:ProgramFiles(x86)}').toString()
		: '', 'MakeMKV', `makemkvcon64${executableSuffix}`)
	.replace(/[\n\r]/gu, '');
export const subtitleEdit = path.resolve(binariesPath, 'SubtitleEdit', `SubtitleEdit${executableSuffix}`);

export const setupComplete = existsSync(path.resolve(dataPath, 'setupComplete'));

export const applicationFiles = {
	mediaDbFile,
	queueDbFile,
	tokenFile,
	configFile,
	sslCA,
	sslCert,
	sslKey,
	ffmpeg,
	ffprobe,
	makeMkv,
	subtitleEdit,
	setupComplete,
};

export enum logLevelEnums {
	error,
	warn,
	info,
	http,
	verbose,
	debug,
	silly,
	socket,
}

export enum logNameEnums {
	'access',
	'app',
	'command',
	'encoder',
	'http',
	'keycloak',
	'log',
	'moviedb',
	'networking',
	'permission',
	'setup',
	'socket',
	'playback',
}

export const logLevels = Object.keys(logLevelEnums).map((type) => {
	return logLevelEnums[type as keyof typeof logLevelEnums];
})
	.filter(i => typeof i == 'string');

export const logNames = Object.keys(logNameEnums).map((type) => {
	return logNameEnums[type as keyof typeof logNameEnums];
})
	.filter(i => typeof i == 'string');


export default {};
