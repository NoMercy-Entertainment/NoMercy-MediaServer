import castv2 from 'castv2';
import { execSync, spawn } from 'child_process';
import ChromecastAPI from 'chromecast-api';
import Device, { DeviceStatus } from 'chromecast-api/lib/device';
import { mkdirSync } from 'fs';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import { transcodesPath } from '../../state';
import { AppState, useSelector } from '../../state/redux';
import { setChromeCast } from '../../state/redux/config/actions';
import { setCast } from '../../state/redux/system/actions';
import { deviceId } from '../system';

export class ChromeCast {

	client: ChromecastAPI;

	client2 = new castv2.Client();

	devices = Array<Device>();
	currentDevice: Device = <Device>{};
	socket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

	internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	host = `https://${this.internal_ip.replace(/\./gu, '-')}.${deviceId}.nomercy.tv:${this.secureInternalPort}`;

	media: Device.MediaResource | null = null;
	heartbeat: castv2.Heartbeat | null = null;
	connection: castv2.Connection | null = null;
	receiver: castv2.Receiver | null = null;
	interval: NodeJS.Timeout = <NodeJS.Timeout>{};

	constructor() {
		this.client = new ChromecastAPI();
		this.socket = useSelector((state: AppState) => state.system.socket);

		this.client.on('device', (device: Device) => {
			this.onDevice(device);
		});

		setInterval(() => {
			this.client.update();
		}, 60 * 1000);

	}

	update() {
		this.client.update();
	}

	status(status) {
		const newStatus = {
			currentTime: status.currentTime,
			playerState: status.playerState,
			media: status.media,
			volume: status.volume,
			liveSeekableRange: status.liveSeekableRange,
		};
		this.socket?.emit('cast_status', newStatus);

		if (this.currentDevice && status.playerState === 'IDLE') {
			this.socket?.emit('cast_finished');
			clearInterval(this.interval);
		}
	}

	currentTime() {

		console.log('currentTime');

		// this.heartbeat?.send({ type: 'STATUS' });

		// this.currentDevice.getStatus((error?: Error | undefined, status?: DeviceStatus | undefined) => {
		// 	if (error) {
		// 		console.error(error);
		// 	} else {
		// 		console.log(status);
		// 		this.socket?.emit('cast_status', status);
		// 	}
		// });

		// this.currentDevice.getCurrentTime((error?: Error | undefined, time?: number | undefined) => {
		// 	if (error) {
		// 		console.error(error);
		// 	} else {
		// 		console.log(time);
		// 		this.socket?.emit('cast_currentTime', time);
		// 	}
		// });
	}

	events() {
		this.socket?.emit('cast_connected', this.currentDevice.friendlyName);
		this.socket?.on('cast_resume', this.currentDevice.resume);
		this.socket?.on('cast_pause', this.currentDevice.pause);
		this.socket?.on('cast_stop', this.currentDevice.stop);
		this.socket?.on('cast_seek', this.currentDevice.seek);
		this.socket?.on('cast_seekTo', this.currentDevice.seekTo);
		this.socket?.on('cast_changeSubtitles', this.currentDevice.changeSubtitles);
		this.socket?.on('cast_subtitlesOff', this.currentDevice.subtitlesOff);
		this.socket?.on('cast_close', this.currentDevice.close);

		return () => {
			this.socket?.off('cast_resume', this.currentDevice.resume);
			this.socket?.off('cast_pause', this.currentDevice.pause);
			this.socket?.off('cast_stop', this.currentDevice.stop);
			this.socket?.off('cast_seek', this.currentDevice.seek);
			this.socket?.off('cast_seekTo', this.currentDevice.seekTo);
			this.socket?.off('cast_changeSubtitles', this.currentDevice.changeSubtitles);
			this.socket?.off('cast_subtitlesOff', this.currentDevice.subtitlesOff);
			this.socket?.off('cast_close', this.currentDevice.close);

			console.log('Casting device disconnected');
		};
	}

	stopLoop() {
		clearInterval(this.interval);
	}

	onDevice(device: Device) {
		console.log('Casting device found: ', device.friendlyName);
		this.setDevice(device);

		this.devices = [...new Set(this.client.devices)];
		setCast(this.devices);

		device.on('status', this.status);

		const events = this.events.bind(this);

		device.on('connected', events);
		device.on('finished', () => events()());

		this.client2.connect(device.host, () => {
			this.connection = this.client2.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
			this.heartbeat = this.client2.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
			this.receiver = this.client2.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

			this.connection.send({ type: 'CONNECT' });

			this.receiver.on('message', (data, broadcast) => {
				this.status(data);
				this.status(broadcast);
			});

			setInterval(() => {
				this.heartbeat?.send({ type: 'PING' });
			}, 500);
		});
	}

	setDevice(device: Device) {
		this.currentDevice = device;
	}

	load({ file, path = '' }: { file: string; path?: string; }) {

		if (!path) {
			path = this.currentDevice.friendlyName;
		}

		const title = 'NoMercy Cast';

		if (file.includes('ttvnw.net')) {

			return this.createMedia({ path: file, title }).play();

		}
		if (file.includes('twitch.tv')) {

			const url = execSync(`yt-dlp "${file}" --get-url`)
				.toString('utf-8')
				.trim();

			return this.createMedia({ path: url, title }).play();

		}
		if (file.includes('youtube.com') || file.includes('youtu.be')) {

			// eslint-disable-next-line max-len
			const reg = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)|youtu\.be\/([a-zA-Z\d_-]+))(?:&.*)??(?:&t=(?<time>\d+)s)?$/u;
			const match = reg.exec(file);
			const startTime = parseInt(match?.groups?.time as string ?? '0', 10);

			const url = `https://www.youtube.com/watch?v=${match?.[1]}`;

			execSync(`yt-dlp -F "${url}&t=${startTime}s"`);

			mkdirSync(`${transcodesPath}/${path}/`, { recursive: true });

			const cmd = [
				'yt-dlp',
				'--youtube-skip-dash-manifest',
				'-g',
				`"${url}&t=${startTime}s"`,
				'-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"',
			].join(' ');

			const data = execSync(cmd, {
				cwd: `${transcodesPath}/${path}`,
			})
				.toString('utf-8')
				.trim()
				.split(/[\n\r]/u);

			const cmd2 = [
				'ffmpeg',
				`-ss ${startTime}`,
				`-i "${data[0]}"`,
				`-ss ${startTime}`,
				`-i "${data[1]}"`,
				'-map 0:v',
				'-map 1:a',
				'-c:v copy',
				'-c:a copy',
				'-n',
				'-f segment',
				'-segment_time 2',
				'-hls_list_size 4',
				'-segment_list_type m3u8',
				'-segment_list video.m3u8',
				'video-%04d.ts',
			].join(' ');

			spawn(cmd2, {
				cwd: `${transcodesPath}/${path}`,
				shell: true,
				windowsHide: true,
				detached: true,
			});

			setTimeout(() => {
				return this.createMedia({ path, title }).play();
			}, startTime
				? (startTime * 10)
				: 10000);

		}

		return this.createMedia({ path, title }).play();
	}

	createMedia({ path, title }: {path: string, title: string}) {

		if (path.includes('http')) {
			this.media = {
				url: path,
				cover: {
					title: title,
					url: 'https://cdn.nomercy.tv/Logos/NoMercy_Entertainment/logo-black.svg',
				},
			};
		} else {
			this.media = {
				url: `${this.host}/transcodes/${path}/video.m3u8`,
				subtitles: [
					{
						language: 'en',
						url: `${this.host}/transcodes/${path}/video_vtt.m3u8`,
						name: 'English',
					},
				],
				cover: {
					title: title,
					url: 'https://cdn.nomercy.tv/Logos/NoMercy_Entertainment/logo-black.svg',
				},
			};
		}

		return this;
	}

	play() {
		if (this.currentDevice) {
			this.currentDevice.play(this.media!, (err: any) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Playing in your chromecast');
					// this.startLoop();
				}
			});
		}
	}

	startLoop() {

		this.interval = setInterval(() => {
			try {
				this.currentDevice.getStatus((error?: Error | undefined, status?: DeviceStatus | undefined) => {
					if (error) {
						this.status(error);
					}
					if (status) {
						this.status(status);
					}
				});
			} catch (error) {
				this.stopLoop();
			}
		}, 500);

	}

};

export const chromeCast = () => {
	setChromeCast(new ChromeCast());
};

export default chromeCast;
