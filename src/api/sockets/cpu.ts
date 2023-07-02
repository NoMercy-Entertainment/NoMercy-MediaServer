import child_process from 'child_process';
import { convertToHuman } from '../../functions/dateTime';
import nosu from 'node-os-utils';
import os from 'os';
import osu from 'os-utils';
import { platform } from '@/functions/system';
import util from 'util';
const memTotal = os.totalmem();
const threads = osu.cpuCount();

const exec = util.promisify(child_process.exec);

const cpuIAverage = (i: string | number) => {
	let totalIdle: number;
	let totalTick: number;
	let type: string | number;

	totalIdle = 0;
	totalTick = 0;
	const cpus = os.cpus();
	const cpu = cpus[i];
	for (type in cpu.times) {
		totalTick += cpu.times[type];
	}
	totalIdle += cpu.times.idle;

	const idle = totalIdle / cpus.length;
	const total = totalTick / cpus.length;
	return {
		idle: idle,
		total: total,
	};
};

const cpuILoadInit = (index) => {
	return function () {
		const start = cpuIAverage(index);
		return function (dif: any = {}) {
			const end = cpuIAverage(index);
			dif.cpu = index;
			dif.idle = Math.round(end.idle - start.idle);
			dif.total = Math.round(end.total - start.total);

			const percent = Math.round(100 - (dif.idle / dif.total) * 100);

			dif.percent = isNaN(percent)
				? 0
				: percent;
			return dif;
		};
	};
};

const cpuILoad = (info: any[]) => {
	const cpus = os.cpus();
	for (let i = 0, len = cpus.length; i < len; i++) {
		const a = cpuILoadInit(i)();
		info.push(a);
	}
	return function () {
		const res: any = [];
		const cpus = os.cpus();
		for (let i = 0, len = cpus.length; i < len; i++) {
			res.push(info[i]());
		}
		return res;
	};
};

const gpuLoad = async () => {

	if (platform == 'windows') {

		let encoder;
		let decoder;
		let _3d;

		const gpuEncodeLoad = '$([math]::Round((((Get-Counter "\\GPU Engine(*engtype_VideoEncode)\\Utilization Percentage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum,2))';
		const EncodeLoad = exec(gpuEncodeLoad, {
			shell: 'powershell.exe',
		}).then((res) => {
			encoder = parseFloat(res.stdout.replace(/[\n\r]+/u, '').trim()
				.replace(',', '.'));
		});

		const gpuDecodeLoad = '$([math]::Round((((Get-Counter "\\GPU Engine(*engtype_VideoDecode)\\Utilization Percentage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum,2))';
		const DecodeLoad = exec(gpuDecodeLoad, {
			shell: 'powershell.exe',
		}).then((res) => {
			decoder = parseFloat(res.stdout.replace(/[\n\r]+/u, '').trim()
				.replace(',', '.'));
		});

		// const _3dDecodeLoad = '$([math]::Round((((Get-Counter "\\GPU Engine(*engtype_3D)\\Utilization Percentage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum,2))';
		// const _3dLoad = exec(_3dDecodeLoad, {
		// 	shell: 'powershell.exe',
		// }).then((res) => {
		// 	_3d = parseFloat(res.stdout.replace(/[\n\r]+/u, '').trim()
		// 		.replace(',', '.'));
		// });

		await Promise.all([EncodeLoad, DecodeLoad]);

		return {
			encoder,
			decoder,
			_3d,
		};
	}
};

let info = [];
setInterval(() => {
	info = info.slice(info.length - threads, info.length);
}, 1500);


export default (socket: { on: (arg0: string, arg1: { (): void; (): void; (): void; }) => void; emit: (arg0: string, arg1: { model: any; os: any; threads: number; platform: 'aix' | 'android' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin'; memUsage: number; memTotal: number; sysUptime: any; Uptime: any; coreUtil: never[]; }) => void; }) => {

	let watcher: string | number | NodeJS.Timeout | undefined;
	clearInterval(watcher);

	socket.on('disconnect', () => {
		clearInterval(watcher);
	});

	socket.on('stop_system_listening', () => {
		// console.log('not listening');
		clearInterval(watcher);
	});

	socket.on('start_system_listening', () => {
		// console.log('listening');
		start();
	});

	function start() {
		clearInterval(watcher);
		watcher = setInterval(async () => {
			const stat = await cpuStats();
			socket.emit('system', stat);
		}, 1000);
	}
};

const cpuStats = async () => {
	const cpu = await nosu.cpu;
	const memFree = os.freemem();
	const mem = Math.round(memTotal) - Math.round(memFree);
	const memUsage = Math.round((mem / memTotal) * 100);
	const operatingSystem = await nosu.os.oos();
	const dist = operatingSystem == 'not supported'
		? os.type().split('_')[0]
		: operatingSystem;
	const coreUtil = await cpuILoad(info)();
	const gpuUtil = await gpuLoad();

	return {
		model: cpu.model().replace(/\s{2,}/gu, ''),
		os: dist,
		threads,
		platform: osu.platform(),
		memUsage,
		memTotal,
		sysUptime: convertToHuman(Math.round(osu.sysUptime())),
		Uptime: convertToHuman(Math.round(osu.processUptime())),
		coreUtil,
		gpuUtil,
	};
};
