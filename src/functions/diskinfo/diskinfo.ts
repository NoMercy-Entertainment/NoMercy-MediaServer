/* eslint-disable */

import os from 'os';
import { execSync } from 'child_process';

const aDrives: any = [];

export default () => {
	let oProcess;

	switch (os.platform().toLowerCase()) {
	case 'win32':
		oProcess = execSync('wmic logicaldisk get Caption,FreeSpace,Size,VolumeSerialNumber,Description  /format:list').toString();
		var aLines = oProcess.split('\r\r\n');
		var bNew = false;
		var sCaption: any = '';
		var sDescription: any = '';
		var sFreeSpace: any = '';
		var sSize: any = '';
		var sVolume: any = '';

		for (var i = 0; i < aLines.length; i++) {
			if (aLines[i] != '') {
				var aTokens = aLines[i].split('=');
				switch (aTokens[0]) {
				case 'Caption':
					sCaption = aTokens[1];
					bNew = true;
					break;
				case 'Description':
					sDescription = aTokens[1];
					break;
				case 'FreeSpace':
					sFreeSpace = aTokens[1];
					break;
				case 'Size':
					sSize = aTokens[1];
					break;
				case 'VolumeSerialNumber':
					sVolume = aTokens[1];
					break;
				}
			} else if (bNew) {
				sSize = parseFloat(sSize);
				if (isNaN(sSize)) {
					sSize = 0;
				}
				sFreeSpace = parseFloat(sFreeSpace);
				if (isNaN(sFreeSpace)) {
					sFreeSpace = 0;
				}

				const sUsed: any = sSize - sFreeSpace;
				let sPercent = '0%';
				if (sSize != '' && parseFloat(sSize) > 0) {
					sPercent = `${Math.round((parseFloat(sUsed) / parseFloat(sSize)) * 100)}%`;
				}
				aDrives[aDrives.length] = {
					filesystem: sDescription,
					blocks: sSize,
					used: sUsed,
					available: sFreeSpace,
					capacity: sPercent,
					mounted: sCaption,
				};
				bNew = false;
				sCaption = '';
				sDescription = '';
				sFreeSpace = '';
				sSize = '';
				sVolume = '';
			}
		}
		return aDrives;
		break;

	case 'linux':
	case 'darwin':
	default:
		oProcess = execSync('df -P | awk \'NR > 1\'').toString();

		var aLines = oProcess.split('\n');

		for (var i = 0; i < aLines.length; i++) {
			let sLine = aLines[i];
			if (sLine != '') {
				sLine = sLine.replace(/ +(?= )/g, '');
				var aTokens = sLine.split(' ');
				aDrives[aDrives.length] = {
					filesystem: aTokens[0],
					blocks: aTokens[1],
					used: aTokens[2],
					available: aTokens[3],
					capacity: aTokens[4],
					mounted: aTokens[5],
				};
			}
		}
		return aDrives;
	}
};
