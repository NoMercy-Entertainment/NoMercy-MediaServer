import { execFileSync, execSync } from 'child_process';
import path, { join } from 'path';

import diskinfo from '../diskinfo';
import { machineIdSync } from 'node-machine-id';
import os from 'os';

export const convertPath = (path: string) => {
	if (process.platform === 'win32') {
		return path.replace(/\//gu, '\\');
	}
	return path;
};

const getPlatform = (): string => {
	let platform: string;
	switch (process.platform) {
	case 'win32':
		platform = 'windows';
		break;
	case 'darwin':
		platform = 'mac';
		break;
	default:
		platform = 'linux';
		break;
	}
	return platform;
};
export const platform = getPlatform();

const getAppPath = (): string => {
	let appPath: string;
	switch (getPlatform()) {
	case 'windows':
		appPath = path.join(process.env.LOCALAPPDATA as string, 'NoMercy');
		break;
	case 'mac':
		appPath = path.join(process.env.HOME as string, 'Library', 'Preferences', 'NoMercy');
		break;
	case 'linux':
		appPath = path.join(process.env.HOME as string, '.local', 'share', 'NoMercy');
		break;
	default:
		throw new Error('Platform unknown');
	}
	return appPath;
};
export const appPath = getAppPath();

export const serviceName = 'NoMercy';
export enum ServiceStatus {
	'notInstalled',
	'unknown',
	'running',
	'stopped',
}

const getServiceStatus = (): ServiceStatus => {
	let status: ServiceStatus = ServiceStatus.unknown;
	switch (getPlatform()) {
	case 'windows':
		let service = '';

		try {
			service = execSync(`Get-Service ${serviceName} | Select-Object -Property Status | Format-List`, {
				shell: 'powershell.exe',
				stdio: 'pipe',
			}).toString()
				.replace(/[\n\r]/gu, '');

		} catch (error) {
			return ServiceStatus.notInstalled;
		}

		const newService = service.match(/Status : (\w+)/u) ?? [];

		if (newService?.length > 0) {
			switch (newService![1]) {
			case 'Running':
				status = ServiceStatus.running;
				break;
			case 'Stopped':
				status = ServiceStatus.stopped;
				break;
			default:
				status = ServiceStatus.unknown;
				break;
			}
		}

		break;
	case 'mac':
		// status = path.join(process.env.HOME as string, 'Library', 'Preferences', 'NoMercy');
		break;
	case 'linux':
		// status = path.join(process.env.HOME as string, '.local', 'share', 'NoMercy');
		break;
	default:
		throw new Error('Platform unknown');
	}

	return status;
};
export const serviceStatus = getServiceStatus();

const getNpxPath = (): string => {
	let path = '';
	switch (getPlatform()) {
	case 'windows':
		path = join(process.env.APPDATA!, 'npm', 'node_modules', 'npm', 'bin', 'npx-cli.js');
		break;
	case 'mac':
	case 'linux':
		path = join(execSync('which npx').toString()
			.replace(/(.+)npx.*$/u, '$1'), 'npm', 'node_modules', 'npm', 'bin', 'npx-cli.js');
		break;
	}

	return convertPath(path);
};
export const npxPath = getNpxPath();

const getInstallPath = (): string => {
	let appPath: string;
	switch (getPlatform()) {
	case 'windows':
		appPath = path.join(process.env.ProgramFiles as string, 'NoMercy');
		break;
	case 'mac':
		appPath = path.join(process.env.HOME as string, 'Library', 'Application Support', 'NoMercy');
		break;
	case 'linux':
		appPath = path.join(process.env.HOME as string, '.NoMercy');
		break;
	default:
		throw new Error('Platform unknown');
	}
	return appPath;
};
export const installPath = getInstallPath();

const getExecutableSuffix = () => {
	let executableSuffix = '';
	switch (getPlatform()) {
	case 'windows':
		executableSuffix = '.exe';
		break;
	default:
		break;
	}

	return executableSuffix;
};
export const executableSuffix = getExecutableSuffix();

interface DrivesMap {
	localDrives: string[];
	opticalDrives: string[];
	networkDrives: string[];
}

export const getDrives = (): DrivesMap => {
	const aDrives = diskinfo();

	const result: DrivesMap = {
		localDrives: aDrives.filter((d: { filesystem: string; }) => d.filesystem == 'Local Fixed Disk'),
		opticalDrives: aDrives.filter((d: { filesystem: string; }) => d.filesystem == 'CD-ROM Disc'),
		networkDrives: aDrives.filter((d: { filesystem: string; }) => d.filesystem == 'Network Connection'),
	};

	return result;
};

export const drives = getDrives();

export const uptime = () => process.uptime();

export const deviceId = machineIdSync(true);
export const deviceName = process.env.COMPUTERNAME ?? process.env.NAME ?? os.hostname() as string;
export const clientName = process.env.eventName as string;
export const cpuCores = parseInt((process.env.NUMBER_OF_PROCESSORS as string), 10);
export const arch = process.arch as string;
export const version = os.type().split('.')[0];

export const hasElevatedPermissions = (): boolean => {
	switch (platform) {
	case 'windows':
		try {
			execFileSync('net', ['session'], { 'stdio': 'ignore' });
			return true;
		} catch (e) {
			return false;
		}
	case 'mac':
	case 'linux':
		return process.env.USER == 'root';
	default:
		return false;
	}
};
