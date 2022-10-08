import { appPath, executableSuffix } from '../functions/system';

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

export const userName = process.env.USERNAME;

export const cachePath = path.resolve(appPath, 'cache');
export const imagesPath = path.resolve(cachePath, 'images');
export const omdbPath = path.resolve(cachePath, 'omdb');
export const tempPath = path.resolve(cachePath, 'temp');
export const transcodesPath = path.resolve(cachePath, 'transcodes');
export const configPath = path.resolve(appPath, 'config');
export const dataPath = path.resolve(appPath, 'data');
export const collectionsPath = path.resolve(dataPath, 'collections');
export const playlistsPath = path.resolve(dataPath, 'playlists');
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

export const applicationPaths = {
	appPath,
	cachePath,
	imagesPath,
	omdbPath,
	tempPath,
	transcodesPath,
	configPath,
	dataPath,
	collectionsPath,
	playlistsPath,
	ScheduledTasksPath,
	subtitlesPath,
	logPath,
	metadataPath,
	libraryPath,
	peoplePath,
	viewsPath,
	pluginsPath,
	pluginConfigPath,
	rootPath,
	certPath,
	binariesPath,
};

export const tokenFile = path.resolve(configPath, 'token.json');
export const configFile = path.resolve(configPath, 'config.json');
export const errorLog = path.resolve(logPath, `errorLog-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.txt`);
export const winstonLog = path.join(logPath, `serverLog-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.log`)
export const winstonRejectionLog = path.join(logPath, `rejectionLog-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.log`)

export const libraryDb = path.resolve(dataPath, 'library.db');
export const configDb = path.resolve(dataPath, 'config.db');
export const queueDb = path.resolve(dataPath, 'queue.db');

export const sslCA = path.resolve(certPath, 'ca.pem');
export const sslCert = path.resolve(certPath, 'cert.pem');
export const sslKey = path.resolve(certPath, 'key.pem');

export const ffmpeg = path.resolve(binariesPath, 'ffmpeg' + executableSuffix);
export const ffprobe = path.resolve(binariesPath, 'ffprobe' + executableSuffix);

export const makeMkv = path
	.resolve(process.platform == 'win32' ? execSync('powershell ${env:ProgramFiles(x86)}').toString() : '', 'MakeMKV', `makemkvcon64${executableSuffix}`)
	.replace(/[\n\r]/gu, '');
export const subtitleEdit = path.resolve(binariesPath, 'SubtitleEdit', 'SubtitleEdit' + executableSuffix);

export const setupComplete = existsSync(path.resolve(dataPath, 'setupComplete'));

export const applicationFiles = {
	libraryDb,
	configDb,
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

export const logLevels = Object.keys(logLevelEnums).map(function(type) {
	return logLevelEnums[type];
}).filter(i => typeof i == 'string');

export const logNames = Object.keys(logNameEnums).map(function(type) {
	return logNameEnums[type];
}).filter(i => typeof i == 'string');


export default {};
