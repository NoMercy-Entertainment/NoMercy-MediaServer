import { exec, execSync } from 'child_process';
import csv2json from 'csvjson-csv2json';
// import fs from 'fs';
import os from 'os';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import Logger from '@server/functions/logger';
import { makeMkv as makeMkvPath } from '@server/state';
import { AppState, useSelector } from '@server/state/redux';

export interface RipperProps {
    makeMkv: string;
}

export interface DiscInfo {
    MSG: string;
    stream: number | string;
    key: number | string;
    value: number | string;
    x: number | string;
}

export enum RipperState {
    'MSG:5055' = 'error',
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    'MSG:5021' = 'error',
    'MSG:3025' = 'stream too short',
    'MSG:3307' = 'stream added',
    'MSG:5011' = 'success',
    'CINFO:1' = 'disc type',
    'CINFO:2' = 'disc title',
}

export class Ripper {
	drives: any;
	makeMkv: any;
	interval: NodeJS.Timeout = <NodeJS.Timeout>{};
	running = false;
	io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
	socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> = <Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>{};
	minimumLength = 120;

	constructor() {
		this.makeMkv = makeMkvPath;
		this.io = useSelector((state: AppState) => state.system.socket);
		this.io.on('connection', (socket) => {
			this.socket = socket;
			this.communication(socket);
		});
	}

	getDrives() {
		console.log('get drives');
		let drives = 0;
		if (os.platform() == 'win32') {
			drives = parseInt(execSync('powershell (New-Object -com "WMPlayer.OCX.7").cdromcollection').toString()
				.split('\r\n')?.[3]?.trim(), 10);
		} else {
			// drives = execSync('lsblk -J').toString();
		}
		console.log(drives);
		this.io.emit('ripper-drives', drives);
		return drives;
	}

	hasDisc = () => {
		console.log('has disc');
		let val = false;
		if (os.platform() == 'win32') {
			val = execSync('powershell Get-WmiObject win32_cdromdrive -Filter "MediaLoaded=True"').toString()
				.trim()
				.split('\r\n').length > 1;
		}
		console.log(val);
		this.io.emit('ripper-has-disc', val);
		return val;
	};

	hasDrive() {
		console.log('has drive');
		let state = false;
		if (os.platform() == 'win32') {
			state = execSync('powershell (New-Object -com "WMPlayer.OCX.7").openState').toString()
				.trim() == '6';
		}
		console.log(state);
		this.io.emit('ripper-has-drive', state);
		return state;

	}

	eject() {
		Logger.log({
			level: 'info',
			name: 'ripper',
			color: 'green',
			message: 'ejecting drive',
		});
		if (os.platform() == 'win32') {
			exec('powershell (New-Object -com "WMPlayer.OCX.7").cdromcollection.item(0).eject()');
		} else {
			exec('eject -r');
		}
		this.io.emit('ripper-state', true);
	}


	start() {
		console.log('start');
		this.interval = setInterval(async () => {
			if (this.hasDrive() && !this.running && this.makeMkv) {
				await this.execute();
			}
		}, 60 * 1000);

	}

	stop() {
		clearInterval(this.interval);
	}

	setMinimumLength(minimumLength: number) {
		this.minimumLength = minimumLength;
	}

	execute() {
		console.log('execute');
		if (this.running) {
			return;
		}
		this.running = true;
		exec(
			`"${this.makeMkv}" -r --cache=1 info disc:0 --directio=true --minlength=${this.minimumLength}`,
			(error, stdout, stderr) => {
				if (error) {
					Logger.log({
						level: 'error',
						name: 'ripper',
						color: 'magentaBright',
						message: JSON.stringify(error),
					});
				}
				if (stderr) {
					Logger.error(stderr.toString());
					return;
				}

				const json = csv2json(`MSG,stream,key,value,x\n\n${stdout}`, { parseNumbers: true });
				this.io.emit('ripper-disc-info', json);
				console.log('done');
				this.running = false;
			}
		);

	}

	parseDiscInfo(json: DiscInfo[]) {
		return json;
	}

	communication(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
		socket.on('ripper-drives', () => {
			this.getDrives();
		});

		socket.on('ripper-has-drive', () => {
			this.hasDrive();
		});

		socket.on('ripper-eject', () => {
			this.eject();
		});

		socket.on('ripper-start', () => {
			this.start();
		});

		socket.on('ripper-stop', () => {
			this.stop();
		});
		socket.on('ripper-execute', () => {
			this.execute();
		});
		socket.on('ripper-has-disc', () => {
			this.hasDisc();
		});

		socket.on('ripper-set-minimum-length', (minimumLength: number) => {
			this.setMinimumLength(minimumLength);
		});
	}

};

