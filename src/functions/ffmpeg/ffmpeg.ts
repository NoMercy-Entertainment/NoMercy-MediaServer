import { ChildProcess, exec, execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync } from 'fs';
import osu from 'os-utils';
import { join } from 'path';
import events, { EventEmitter } from 'events';
// import { resume, suspend } from 'ntsuspend';

import type { ArrayElementType, Audio, VideoFFprobe, VideoQuality } from '../../encoder/ffprobe/ffprobe';
import getVideoInfo from '../../encoder/ffprobe/getVideoInfo';
import { ffmpeg, subtitleEdit, transcodesPath, userDataPath } from '@server/state';
import { convertToHuman, convertToSeconds } from '../dateTime';
import { setInterval } from 'timers';
import Logger from '../logger/logger';
import M3U8FileParser from 'm3u8-file-parser';
import { getQualityTag } from './quality/quality';
import { EncodingLibrary } from '@server/db/media/actions/libraries';

export class FFMpeg extends EventEmitter {
	file = '';
	path = '';
	title = '';
	version: string | null = null;
	lutFile: string | null = null;
	frameRate: number | null = null;
	cmd: any;
	isHDR = false;
	#wantsSDR = false;
	#reEncode = false;
	burnSubs = false;
	index = Math.floor(Math.random() * 2000000000);
	hasGpu = false;

	streams: VideoFFprobe['streams'] = <VideoFFprobe['streams']>{};
	chapters: VideoFFprobe['chapters'] | undefined = <VideoFFprobe['chapters']>{};
	format: VideoFFprobe['format'] = <VideoFFprobe['format']>{};
	attachments: VideoFFprobe['streams']['attachments'] = <VideoFFprobe['streams']['attachments']>{};
	error: VideoFFprobe['error'] | null = null;
	myEmitter = new events.EventEmitter();

	videoFilters: {
		[key: string]: string;
	}[] = [];

	filterComplex: string[] = [];

	beforeInputCommands: [string, string?][] = [];

	audioFilters: {
		[key: string]: string;
	}[] = [];

	commands: [string, string?][] = [];

	threads = osu.cpuCount();

	baseFolder = '';
	episodeFolder = '';
	fileName = '';
	progressFile = '';
	debug = false;

	thumbnailsFolder = '';
	previewFiles = '';
	spriteFile = '';
	chaptersFile = '';
	fontsFile = '';
	subtitleFolder = '';
	manifestFile = '';
	mp4File = '';
	fontsFolder = '';

	year = 0;
	seasonNumber: any;
	episodeNumber: any;

	library: EncodingLibrary = <EncodingLibrary>{};
	qualities: VideoQuality[] = [];
	share = '';

	videoStreams: { size: string; quality: VideoQuality; }[] = [];
	audioStreams: string[] = [];
	subtitleStreams: string[] = [];
	thumbnailStreams: string[] = [];
	isMultiBitrate = false;
	percent = 0;

	fullTitle = '';
	currentProgress: any = {};
	repeatInterval: NodeJS.Timeout = <NodeJS.Timeout>{};

	reader = new M3U8FileParser();

	constructor() {
		super();
		this.version = this.#getVersion();

		this.myEmitter.setMaxListeners(20);

		return this;
	}

	#getVersion() {
		const res = execSync(`${ffmpeg} -version`);
		if (!Buffer.isBuffer(res)) {
			throw new Error('No valid ffmpeg present');
		}

		const matches = /([\d{1,2}.]+|N-[\d]+).*Copyright \(c\) 2000-20\d{2} the FFmpeg developers/gu.exec(res.toString('utf-8'));
		if (!matches?.length) {
			throw new Error('No valid ffmpeg present');
		}

		return matches[1];
	}

	open(file: string) {
		return new Promise(async (resolve, reject) => {
			file = file.replace('Z:/mnt/m/', 'M:/');
			if (!file.includes('http') && !existsSync(file)) {
				reject(new Error('File does not exist'));
			}
			this.file = file;

			this.getEncoderType();

			const info = await getVideoInfo(file);
			if (info.error) {
				reject(new Error(`Can't process file: ${this.file}`));
			}

			this.streams = info.streams;
			this.chapters = info.chapters;
			this.format = info.format;
			this.attachments = info.streams.attachments;

			this.getHDRFilter();
			this.getCropFilter();

			return resolve(this);
		});
	}

	getEncoderType() {
		try {
			execSync(`${ffmpeg} -hide_banner -init_hw_device opencl=ocl -version 2>&1`).toString('utf-8');
			this.hasGpu = true;
		} catch (error: any) {
			this.hasGpu = false;
		}
	}

	toDisk(path: string) {
		mkdirSync(path, { recursive: true });
		this.path = path;
		return this;
	}

	createPipe() {
		const framerate = this.getFrameRate();

		if (this.isMultiBitrate || !existsSync(this.getFile(['sprite.webp']))) {
			this.addCommand('-i', 'pipe:', true);
		}

		if (!this.debug && (this.isMultiBitrate || !existsSync(this.getFile(['sprite.webp'])))) {
			this.addCommand('-nostats', undefined, true);
			this.addCommand('-progress', '-', true);
		}

		if (this.isMultiBitrate || !existsSync(this.getFile(['sprite.webp']))) {
			this.addCommand(ffmpeg, undefined, true).addCommand('-', '|', true)
				.addCommand('-f', 'matroska', true);

			this.addCommand('-c:s', 'copy', true).addCommand('-c:a', 'copy', true)
				.addCommand('-map', '0:s', true)
				.addCommand('-map', '0:a', true);

			this.addCommand('-keyint_min', framerate, true)
				.addCommand('-x264opts', `"keyint=${framerate}:min-keyint=${framerate}:no-scenecut"`, true)
				.addCommand('-g', framerate, true)
				.addCommand('-pix_fmt', 'yuv420p', true)
				.addVideoFilters(true)
				.addCommand('-c:v', 'rawvideo', true)
				.addCommand('-map', '0:0', true);
		} else {
			this.addCommand('-keyint_min', framerate, true)
				.addCommand('-x264opts', `"keyint=${framerate}:min-keyint=${framerate}:no-scenecut"`, true)
				.addCommand('-g', framerate, true)
				.addVideoFilters()
				.addCommand('-pix_fmt', 'yuv420p', true);

			if (!this.debug) {
				this.addCommand('-nostats', undefined, true);
				this.addCommand('-progress', '-', true);
			}
		}

		this.addCommand('-i', `"${this.file}"`, true)
			.addCommand('-probesize', '4092M', true)
			.addCommand('-analyzeduration', '9999M', true)
			.addCommand('-hide_banner', undefined, true)
			.addCommand('-threads', Math.floor(this.threads * 0.75), true);

		if (!this.debug) {
			this.addCommand('-nostats', undefined, true);
		}

		if (this.#reEncode) {
			this.addCommand('-re', undefined, true);
		}

		for (const [key, val] of this.beforeInputCommands) {
			this.addCommand(key, val, true);
		}

		this.addCommand(ffmpeg, undefined, true);

		return this;
	}

	#openCommand() {
		if (!this.isHDR) {
			this.addCommand('-i', `"${this.file}"`, true);

			for (const [key, val] of this.beforeInputCommands) {
				this.addCommand(key, val, true);
			}

			this.addCommand('-probesize', '4092M', true);
			this.addCommand('-analyzeduration', '9999M', true);
			this.addCommand('-async', '1', true);
			this.addCommand('-vsync', '-1', true);

			if (!this.debug) {
				this.addCommand('-nostats', undefined, true);
				this.addCommand('-progress', '-', true);
			}

			if (this.#reEncode) {
				this.addCommand('-re', undefined, true);
			}
			this.addCommand('-hide_banner', undefined, true);
			this.addCommand('-threads', Math.floor(this.threads * 0.75), true);
			this.addCommand(ffmpeg, undefined, true);
		}

		return this;
	}

	#closeCommand() {
		this.progressFile = join(transcodesPath, `progress_${this.title}_${this.index}.txt`);

		this.addCommand('-y');
		if (!this.debug) {
			// this.addCommand('>', `"${this.progressFile}" 2>&1`);
			// this.addCommand('>', `"${this.progressFile}" `);
		}
		return this;
	}

	onProgress(callback: (progress: any) => unknown) {
		this.myEmitter.on('progress', (data) => {
			callback(data);
		});
	}

	setTitle(title: string) {
		this.title = title;

		return this;
	}

	setReEncode(value: boolean) {
		this.#reEncode = value;
		return this;
	}

	enableDebug() {
		this.debug = true;

		return this;
	}

	getLastThumb() {
		try {
			return readdirSync(this.thumbnailsFolder)
				.filter(f => f.endsWith('.jpg'))
				.pop();
		} catch (error) {
			return '';
		}
	}

	getChildProcesses(pid: number) {
		return execSync(`wmic process where (ParentProcessId=${pid}) get ProcessId`)
			.toString()
			.split(/[\n\r]/u)
			.slice(1)
			.filter(line => line.match(/\d+/u))
			.map(id => parseInt(id.trim(), 10));
	}

	repeatProgress() {
		this.repeatInterval = setInterval(() => {
			this.emit.bind(this)('progress', this.currentProgress);
		}, 5000);
	}

	cancelRepeatProgress() {
		this.repeatInterval && clearInterval(this.repeatInterval);
	}

	suspendChildren(makeProcess: ChildProcess) {
		if (process.platform === 'win32') {
			const ids = this.getChildProcesses(makeProcess.pid!);
			const pids = ids.length + 1;
			// if (suspend(makeProcess.pid)) {
			// 	console.log(`Suspended process: ${makeProcess.pid}`);
			// 	pids -= 1;
			// } else {
			// 	console.log(`Could not suspend process: ${makeProcess.pid}`);
			// }
			// for (const id of ids ?? []) {
			// 	if (suspend(id)) {
			// 		console.log(`Suspended process: ${id}`);
			// 		pids -= 1;
			// 	} else {
			// 		console.log(`Could not suspend process: ${id}`);
			// 	}
			// }
			if (pids == 0) {
				console.log(`Suspended: ${this.fullTitle}`);
				const lastThumb = this.getLastThumb();
				setTimeout(() => {
					this.emit.bind(this)('paused', {
						id: this.index,
						progress: 'paused',
						title: this.fullTitle,
						percent: this.percent,
						thumbnails: lastThumb
							? `/${this.share}/${this.baseFolder}/${this.episodeFolder}/thumbs/${lastThumb}`
							: null,
					});
				}, 500);
				this.currentProgress.progress = 'paused';
				this.repeatProgress();
			}
		} else {
			makeProcess.kill('SIGSTOP');
		}
	}

	resumeChildren(makeProcess: ChildProcess) {
		if (process.platform === 'win32') {
			const ids = this.getChildProcesses(makeProcess.pid!);
			const pids = ids.length + 1;
			// if (resume(makeProcess.pid)) {
			// 	console.log(`Resumed process: ${makeProcess.pid}`);
			// 	pids -= 1;
			// } else {
			// 	console.log(`Could not suspend process: ${makeProcess.pid}`);
			// }
			// for (const id of ids ?? []) {
			// 	if (resume(id)) {
			// 		console.log(`Resumed process: ${id}`);
			// 		pids -= 1;
			// 	} else {
			// 		console.log(`Could not resume process: ${id}`);
			// 	}
			// }
			if (pids == 0) {
				console.log(`Resumed: ${this.fullTitle}`);
				const lastThumb = this.getLastThumb();
				this.emit.bind(this)('resumed', {
					id: this.index,
					progress: 'continue',
					title: this.fullTitle,
					speed: 0,
					percent: this.percent,
					days: null,
					hours: null,
					minutes: null,
					seconds: null,
					thumbnails: lastThumb
						? `/${this.share}/${this.baseFolder}/${this.episodeFolder}/thumbs/${lastThumb}`
						: null,
				});
				this.cancelRepeatProgress();
			}
		} else {
			makeProcess.kill('SIGCONT');
		}
	}

	sendProgress(data: string) {
		// eslint-disable-next-line max-len
		const match
			// eslint-disable-next-line max-len
			= /(frame=(?<frame>\d+)\n)?(fps=(?<fps>[\d\.]+)(\n.+){1,}\n)?(bitrate=(?<bitrate>(\s+)?([\d\s\.-]+|N\/A))(kbits\/s|N\/A)?(\n.+){1,}\n)(out_time=(?<time>(-)?\d{2,}:\d{2,}:\d{2,})\.\d*(\n.+){1,}\n)(speed=(\s+)?(?<speed>([\d\s\.-]+x|N\/A))\n)(progress=(\s+)?(?<progress>\w+))/gmu.exec(
				data
			);

		// console.log(data);
		if (!match?.groups) {
			// console.log(data);
			return;
		}

		const currentTime = convertToSeconds(match?.groups?.time);
		const duration = this.format.duration;
		const speed = parseFloat(match?.groups?.speed);
		const remaining = Math.floor(((duration as number) - currentTime) / speed);
		this.percent = Math.floor((currentTime / (duration as number)) * 100);
		// console.log({ duration, currentTime, remaining, speed, percent: this.percent });
		const remainingHMS = convertToHuman(remaining);
		const remainingSplit = remainingHMS.split(':');

		const days = remainingSplit[0] > 0
			? `${remainingSplit[0]}`
			: null;
		const hours = remainingSplit[1] == '00'
			? null
			: `${remainingSplit[1]}`;
		const minutes = remainingSplit[2] == '00'
			? null
			: `${remainingSplit[2]}`;
		const seconds = `${remainingSplit[3] || '00'}`;

		const lastThumb = this.getLastThumb();

		this.currentProgress = {
			id: this.index,
			title: this.fullTitle,
			path: this.path,
			thumbnailStreams: this.thumbnailStreams,
			videoStreams: this.qualities.map(v => getQualityTag(v)).join(', '),
			audioStreams: this.streams.audio.map(a => a.language).join(', '),
			subtitleStreams: this.streams.subtitle.map(s => s.language).join(', '),
			hasGpu: this.hasGpu,
			isHDR: this.isHDR,
			percent: this.percent,
			thumbnails: lastThumb
				? `/${this.share}/${this.baseFolder}/${this.episodeFolder}/thumbs/${lastThumb}`
				: null,
			frame: match?.groups?.frame ?? 0,
			fps: match?.groups?.fps ?? 0,
			bitrate: match?.groups?.bitrate.trim() ?? 0,
			progress: match?.groups?.progress,
			status: 'running',
			speed,
			duration,
			remaining,
			remainingHMS,
			remainingSplit,
			currentTime,
			days,
			hours,
			minutes,
			seconds,
		};

		this.emit('progress', this.currentProgress);
	}

	start(cb?: (arg?: any) => unknown) {
		return new Promise(async (resolve, reject) => {
			if (this.commands.length == 0) {
				console.error('No commands to execute');
				await cb?.();
				return resolve(this);
			}

			const path = join(this.path);
			const command = this.buildCommand();
			console.log(command);

			const makeProcess = exec.bind(this)(
				command,
				{
					cwd: path,
					maxBuffer: Infinity,
				},
				(error) => {
					if (error) {
						console.error(error);
						// reject(error);
					}
				}
			);

			makeProcess.stdout?.on('data', (data) => {
				this.sendProgress.bind(this)(data);
				if (data.includes('progress=end')) {
					cb?.();

					resolve(this);
				}
			});

			makeProcess.on('exit', async (code) => {
				console.log('exit', code);

				await cb?.();
				if (code == 1) {
					reject(new Error('Failed to encode file'));
				} else {
					resolve(this);
				}
			});

			this.on('message', (data) => {
				// console.log('msg', data);
				if (data.id !== this.index) return;

				if (data.type == 'encoder-pause') {
					this.suspendChildren(makeProcess);
				} else if (data.type == 'encoder-resume') {
					this.resumeChildren(makeProcess);
				} else if (data.type == 'encoder-stop') {
					makeProcess.kill('SIGTERM');
				} else if (data.type == 'encoder-restart') {
					makeProcess.kill('SIGTERM');
					this.start();
				}
			});

		});
	}

	addPreInputCommand(key: string, val?: string | number) {
		this.beforeInputCommands.push([key, val?.toString() ?? '']);
		return this;
	}

	addCommand(key: string, val?: string | number, before = false) {
		let arr: any = [];

		if (val) {
			arr = [key, val];
		} else {
			arr = [key];
		}

		if (before) {
			this.commands.unshift(arr);
		} else {
			this.commands.push(arr);
		}
		return this;
	}

	buildCommand() {
		this.#closeCommand();

		this.#openCommand();

		return this.commands
			.map(([key, val]) => (val
				? `${key} ${val}`
				: key))
			.join(' ')
			.replace(/[\n\r]*/gu, '');
	}

	addVideoFilter(key: string, val: string) {
		this.videoFilters[key] = val;

		return this;
	}

	buildVideoFilter() {
		let filter = '';

		const array = Object.entries(this.videoFilters);
		array.map(([key, val], index) => {
			if (val) {
				filter += `${key}=${val}`;
			} else {
				filter += `${key}`;
			}
			if (index < array.length - 1) {
				filter += ',';
			}
		});
		this.videoFilters = [];

		return filter;
	}

	addFilterComplex(val) {
		this.filterComplex.push(val);

		return this;
	}

	buildFilterComplex(vf: string) {
		let filter = '';
		if (this.filterComplex) {
			filter += this.filterComplex.join('');
			filter += `,${vf}`;
			filter += '[v]';
		}
		return filter;
	}

	addVideoFilters(before = false) {
		const vf = this.buildVideoFilter();

		if (!vf) {
			return this;
		}

		this.addCommand('-vf', `"${vf}"`, before);

		return this;
	}

	addAudioFilter(key: string, val: string) {
		this.audioFilters[key] = val;
		return this;
	}

	buildAudioFilter() {
		let filter = '';
		const array = Object.entries(this.audioFilters);
		array.map(([key, val], index) => {
			filter += `${key}=${val}`;
			if (index < array.length - 1) {
				filter += ',';
			}
		});
		return filter;
	}

	addAudioFilters() {
		const af = this.buildAudioFilter();

		if (!af) {
			return this;
		}

		this.addCommand('-af', af);
		return this;
	}

	getFile(name: string[]) {
		const folder = join(this.path, ...name.slice(0, name.length));
		return folder;
	}

	addFile(name: string[]) {
		const folder = join(this.path, ...name.slice(0, name.length - 1));
		const path = join(...name.slice(0, name.length - 1), name[name.length - 1]);

		const dir = `${folder}/${path.split(/[\\\/]/u)[0].replace(/\w+\.\w{3,4}$/u, '')}`;

		if (!dir.endsWith('.')) {
			console.log('making folder:', `${folder}/${path.split(/[\\\/]/u)[0].replace(/\w+\.\w{3,4}$/u, '')}`);
			mkdirSync(dir, { recursive: true });
		}

		this.addCommand(path);
		return this;
	}

	getHDRFilter() {
		this.isHDR = this.streams.video.some(stream => stream.color_space?.includes('bt2020') || stream.color_primaries?.includes('bt2020'));

		if (this.lutFile && this.isHDR && !this.#wantsSDR) {
			this.addVideoFilter('lut3d', `"${userDataPath}/${this.lutFile}"`);
			this.addVideoFilter('zscale', 'p=bt709');
			this.addVideoFilter('zscale', 't=bt709:m=bt709:r=tv');
			this.addVideoFilter('eq', 'saturation=0.95');
		}

		if (this.isHDR && this.hasGpu) {
			this.addPreInputCommand('-vsync', '0');
			this.addPreInputCommand('-extra_hw_frames', '3');
			this.addPreInputCommand('-init_hw_device', 'opencl=ocl');
		}
		if (this.isHDR && !this.#wantsSDR) {
			if (this.hasGpu) {
				this.addVideoFilter('format', 'p010');
				this.addVideoFilter('hwupload', '');
				this.addVideoFilter('tonemap_opencl', 'tonemap=mobius:param=0.01:desat=0:r=tv:p=bt709:t=bt709:m=bt709:format=nv12');
				this.addVideoFilter('hwdownload', '');
				this.addVideoFilter('format=nv12', '');
			} else {
				this.addVideoFilter('zscale', 'tin=smpte2084:min=bt2020nc:pin=bt2020:rin=tv:t=smpte2084:m=bt2020nc:p=bt2020:r=tv');
				this.addVideoFilter('zscale', 't=linear:npl=100');
				this.addVideoFilter('format', 'gbrpf32le');
				this.addVideoFilter('zscale', 'p=bt709');
				this.addVideoFilter('tonemap', 'tonemap=hable:desat=0');
				this.addVideoFilter('zscale', 't=bt709:m=bt709:r=tv');
				this.addVideoFilter('eq', 'saturation=0.85');
			}
		}
		return this;
	}

	getCropFilter() {
		function chooseCrop(crops) {
			return Object.keys(crops).reduce(
				(res, key) => {
					if (res.max < crops[key]) {
						res.max = crops[key];
						res.key = key;
					}
					return res;
				},
				{ max: 0, key: '' }
			).key;
		}

		const crop = execSync(
			`${ffmpeg} -ss 120 -i "${this.file}" -max_muxing_queue_size 999 -vframes 1000 -vf cropdetect -t 1000 -f null - 2>&1`
		).toString('utf-8');

		const counts = {};
		const regex = /crop=(\d+:\d+:\d+:\d+)$/gmu;
		let m;
		while ((m = regex.exec(crop)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			m.forEach((match, groupIndex) => {
				if (groupIndex == 1) {
					const crop = match;
					counts[crop] = (counts[crop] || 0) + 1;
				}
			});
		}
		const result = chooseCrop(counts);

		if (!result) return;

		if (this.isHDR) {
			this.addVideoFilter('crop', result);

			return this;
		}

		this.addVideoFilter('crop', result);

		return this;
	}

	getFrameRate() {
		if (!this.streams) return;

		const fr = this.streams.video[0].r_frame_rate.split('/');
		const rate = parseInt(fr[0], 10) / parseInt(fr[1], 10);

		this.frameRate = Math.floor(rate);

		return this.frameRate;
	}

	getExtension(stream: ArrayElementType<VideoFFprobe['streams']['subtitle']>) {
		let extension;
		switch (stream.codec_name) {
		case 'ass':
		case 'ssa':
			extension = 'ass';
			break;
		case 'hdmv_pgs_subtitle':
		case 'pgs_subtitle':
			extension = 'sup';
			break;
		case 'dvdsub':
		case 'dvd_subtitle':
			extension = 'sub';
			break;
		default:
			extension = 'vtt';
			break;
		}
		return extension;
	}

	getSubType(stream: ArrayElementType<VideoFFprobe['streams']['subtitle']>, index = 0) {
		if (!stream?.title && index == 0) return 'full';
		// else if(!stream?.title && index == 1) return 'sign'
		if (!stream?.title) return 'full';
		if (stream?.title.match(/sign/iu)) return 'sign';
		if (stream?.title.match(/forced/iu)) return 'forced';
		if (stream?.title.match(/sdh/iu)) return 'sdh';
		if (stream?.title.match(/full/iu)) return 'full';
		return 'full';
	}

	#burnSubTitle(stream: ArrayElementType<VideoFFprobe['streams']['subtitle']>, externalFile?: string) {
		const ext = this.getExtension(stream);

		if (externalFile) {
			this.addCommand('-map "0:v:0"');

			if (ext == 'srt' || ext == 'vtt') {
				this.addVideoFilter('subtitles', `${externalFile}`);
			} else {
				this.addVideoFilter('ass', `"${externalFile}"`);
			}

			return this;
		}

		this.addFilterComplex('[0:v]');
		if (ext == 'srt' || ext == 'vtt') {
			this.addFilterComplex(`[0:${stream.index}]overlay`);
			this.addCommand('-map "[v]"');
		} else if (ext == 'ass') {
			this.addFilterComplex(`[0:${stream.index}]overlay`);
			this.addCommand('-map [v]"');
		} else if (ext == 'sup') {
			this.addFilterComplex(`[0:${stream.index}]overlay`);
			this.addCommand('-map "[v]"');
		}

		return this;
	}

	burnSubtitle(index: number, file: string) {
		if (!this.streams.subtitle.length) return this;

		this.#burnSubTitle(this.streams.subtitle[index], file);
		this.burnSubs = true;

		return this;
	}

	convertSubsToVtt() {
		if (existsSync(this.subtitleFolder)) {

			const files = readdirSync(this.subtitleFolder);

			for (const s of files) {

				if ((!s.match(/.ass$|.vtt$/u) && !existsSync(this.subtitleFolder + s.replace(/\.\w{3}$/u, '.vtt')))) {
					try {

						if (!existsSync(`${this.subtitleFolder}/${s}`)) {
							execSync(`${subtitleEdit} /convert "${this.subtitleFolder}/${s}" WebVtt`);
						}

						if (JSON.parse(process.env.CONFIG as string).keepOriginal.subtitles
							&& existsSync(this.subtitleFolder + s)
							&& !s.match(/.ass$|.vtt$/u)
						) {
							try {
								renameSync(this.subtitleFolder + s, `${this.subtitleFolder}../original/${s}`);
							} catch (error) {
								//
							}
						} else if (existsSync(this.subtitleFolder + s) && !s.match(/.ass$|.vtt$/u)) {
							try {
								rmSync(this.subtitleFolder + s);
							} catch (error) {
								//
							}
						}
					} catch (error) {
						//
					}
				}
			}
		}
	};

	sortByPriorityKeyed = (sortingOrder: { [x: string]: any; }, key: PropertyKey, order = 'desc') => {
		if (Array.isArray(sortingOrder)) {
			sortingOrder = this.#createEnumFromArray(sortingOrder);
		}
		return function (a: Audio, b: Audio): number {
			// eslint-disable-next-line no-prototype-builtins
			if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
				return 0;
			}

			if (!a[key]) {
				return 0;
			}

			const first = a[key].toString().toLowerCase() in sortingOrder
				? sortingOrder[a[key]]
				: Number.MAX_SAFE_INTEGER;
			const second = b[key].toString().toLowerCase() in sortingOrder
				? sortingOrder[b[key]]
				: Number.MAX_SAFE_INTEGER;

			let result = 0;
			if (first > second) {
				result = -1;
			} else if (first < second) {
				result = 1;
			}
			return order === 'desc'
				? ~result
				: result;
		};
	};

	#createEnumFromArray = (array: any[]) => {
		return array.reduce((res: { [x: string]: any; }, key: string | number, index: number) => {
			res[key] = index + 1;
			return res;
		}, {});
	};

	getQualityTag(qualities: VideoQuality[]) {
		const sizes = qualities?.map((s) => {
			if (s.width >= 600 && s.width < 1200) {
				return 'SD';
			}
			if (s.width >= 1200 && s.width < 1900) {
				return 'HD720p';
			}
			if (s.width >= 1900 && s.width < 2000) {
				return 'HD1080p';
			}
			if (s.width >= 2000 && s.width < 3000) {
				return '2K';
			}
			if (s.width >= 3000) {
				return '4K';
			}
			return 'Unknown';
		});

		return sizes?.join(',');
	}

	getBitrate(quality: VideoQuality) {
		let rate = 1024 * 2;
		if ((quality.width ?? 0) >= 600 && (quality.width ?? 0) < 1200) {
			rate = 1024 * 5;
		} else if ((quality.width ?? 0) >= 1200 && (quality.width ?? 0) < 1900) {
			rate = 1024 * 4;
		} else if ((quality.width ?? 0) >= 1900 && (quality.width ?? 0) < 2000) {
			rate = 1024 * 3;
		} else if ((quality.width ?? 0) >= 2000 && (quality.width ?? 0) < 3000) {
			rate = 1024 * 2;
		} else if ((quality.width ?? 0) >= 3000) {
			rate = 1024 * 1;
		}

		if (quality.bitrate && this.format.duration) {
			return Math.floor(((this.format.duration as number) * quality.bitrate) / 8 / rate);
		}

		if (this.format.bit_rate && this.format.bit_rate != 'N/A' && this.format.duration) {
			return Math.floor(((this.format.duration as number) * this.format.bit_rate) / 8 / rate);
		}

		if (this.format.duration) {
			const size = this.#getTotalSize(this.format.filename.replace(/[\\\/][^\\\/]+(?=.*\w*)$/u, ''));
			return Math.floor(size / (this.format.duration as number) / 8 / rate);
		}

		return 520929;
	}

	getExistingSubtitles() {
		const arr: any[] = [];

		if (!existsSync(this.subtitleFolder)) {
			this.streams.subtitle.forEach((s) => {
				arr.push({
					language: s.language,
					type: this.getSubType(s) as string,
					ext: this.getExtension(s),
				});
			});

			return arr;
		}

		const files = readdirSync(this.subtitleFolder);
		files
			.filter(f => !f.match(/-\w{5,}\.\w{3}$/u))
			.filter(f => f.match(/.ass$|.vtt$/u))
			.forEach((f) => {
				const reg = /(?<lang>\w{3}).(?<type>\w{3,4}).(?<ext>\w{3})$/u.exec(f);
				if (reg?.groups) {
					arr.push({
						language: reg.groups.lang,
						type: reg.groups.type,
						ext: reg.groups.ext,
					});
				}
			});

		return arr;
	}

	#getTotalSize(dir: string) {
		let totalSize = 0;
		if (existsSync(dir) && statSync(dir).isDirectory()) {
			const files = readdirSync(dir);
			files.forEach((file) => {
				totalSize += statSync(`${dir}/${file}`).size;
			});
		}
		return totalSize;
	}

	async verifyMP4() {

		Logger.log({
			level: 'info',
			name: 'Encoder',
			color: 'cyanBright',
			message: `Verifying: ${this.mp4File.replace(/.*[\\\/]/u, '')}`,
		});

		if (!existsSync(this.mp4File)) {
			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message: `no file: ${this.mp4File.replace(/.*[\\\/]/u, '')}`,
			});
			return false;
		}

		if (!this.mp4File.endsWith('.mp4')) {
			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message:
					`file is not a mp4 file so is not playable on all devices: ${this.mp4File.replace(/.*[\\\/]/u, '')}`,
			});
			return false;
		}

		const ffprobe = await getVideoInfo(this.mp4File)
			.catch((reason) => {
				Logger.log({
					level: 'error',
					name: 'Encoder',
					color: 'red',
					message:
						`Error while getting video info: ${reason.file
						}, reason: ${reason.error || 'unknown'}`,
				});
			});

		if (!ffprobe || !ffprobe.streams || !ffprobe.format || ffprobe.format.duration == 'N/A') {
			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message:
					`File doesn't have a duration: ${this.mp4File.replace(/.*[\\\/]/u, '')}`,
			});
			return false;
		}

		if (this.format && (ffprobe.format.duration != this.format?.duration) && typeof this.format?.duration == 'number') {

			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message:
					`File duration is too ${ffprobe.format.duration < this.format?.duration
						? 'short: '
						: 'long: '
					}${this.mp4File.replace(/.*[\\\/]/u, '')}`,
			});
			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message:
					`File input ${ffprobe.format.filename} output: ${this.format?.filename
					}${this.mp4File.replace(/.*[\\\/]/u, '')}`,
			});
			return false;
		}

		if (ffprobe.streams.video[0].level > 40) {
			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message:
					`File is not playable on all devices: ${this.mp4File.replace(/.*[\\\/]/u, '')}`,
			});
			return false;
		}

		Logger.log({
			level: 'info',
			name: 'Encoder',
			color: 'cyanBright',
			message: `File: ${this.mp4File.replace(/.*[\\\/]/u, '')} Ok`,
		});

		return true;
	}

	verifyMkv() {
		return false;
	}

	verifyHLS() {

		if (!existsSync(this.manifestFile)) {
			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message: `no manifest: ${this.fileName}.m3u8`,
			});
			return false;
		}

		this.reader.read(readFileSync(this.manifestFile, 'utf-8'));
		const manifestFileResult = this.reader.getResult();
		this.reader.reset();

		for (const item of manifestFileResult.segments ?? []) {

			if (!existsSync(this.getFile([item.url]))) {
				Logger.log({
					level: 'error',
					name: 'Encoder',
					color: 'cyanBright',
					message: `no segment: ${item.url}`,
				});
				return false;
			}

			this.reader.read(readFileSync(this.getFile([item.url]), 'utf-8'));
			const fileResult = this.reader.getResult();
			this.reader.reset();

			if (!fileResult.endList) {
				Logger.log({
					level: 'error',
					name: 'Encoder',
					color: 'cyanBright',
					message: `no endlist: ${item.url}`,
				});
				return false;
			}
			Logger.log({
				level: 'info',
				name: 'Encoder',
				color: 'cyanBright',
				message: `yes endlist: ${item.url}`,
			});

			// for (const file of fileResult.segments ?? []) {
			// 	if (!existsSync(join(this.path, item.url.split('/')[0], file.url))) {
			// 		Logger.log({
			// 			level: 'error',
			// 			name: 'Encoder',
			// 			color: 'cyanBright',
			// 			message: `no segment: ${join(this.path, item.url.split('/')[0], file.url)}`,
			// 		});
			// 		return false;
			// 	}
			// }
		}

		if (!manifestFileResult.media) {
			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message: `no media: ${this.fileName}.m3u8`,
			});
			return false;
		}
		if (!manifestFileResult.segments) {
			Logger.log({
				level: 'error',
				name: 'Encoder',
				color: 'cyanBright',
				message: `no segments: ${this.fileName}.m3u8`,
			});
			return false;
		}
		Logger.log({
			level: 'info',
			name: 'Encoder',
			color: 'cyanBright',
			message: `yes: ${this.fileName}.m3u8`,
		});

		for (const audio of Object.entries(manifestFileResult.media?.AUDIO?.[Object.keys(manifestFileResult.media?.AUDIO)[0]]) ?? []) {
			const item = audio[1] as any;
			if (!existsSync(this.getFile([item.uri]))) {
				Logger.log({
					level: 'error',
					name: 'Encoder',
					color: 'cyanBright',
					message: `no segment: ${item.uri}`,
				});
				return false;
			}
			this.reader.read(readFileSync(this.getFile([item.uri]), 'utf-8'));
			const result = this.reader.getResult();
			this.reader.reset();

			// for (const file of result.segments ?? []) {
			// 	if (!existsSync(join(this.path, item.uri.split('/')[0], file.url))) {
			// 		Logger.log({
			// 			level: 'error',
			// 			name: 'Encoder',
			// 			color: 'cyanBright',
			// 			message: `no segment: ${join(this.path, item.uri.split('/')[0], file.url)}`,
			// 		});
			// 		return false;
			// 	}
			// }

			if (!result.endList) {
				Logger.log({
					level: 'error',
					name: 'Encoder',
					color: 'cyanBright',
					message: `no endlist: ${item.uri}`,
				});
				return false;
			}
			Logger.log({
				level: 'info',
				name: 'Encoder',
				color: 'cyanBright',
				message: `yes endlist: ${item.uri}`,
			});
		}
		Logger.log({
			level: 'info',
			name: 'Encoder',
			color: 'cyanBright',
			message: 'm3u8 ok',
		});

		return true;
	}
}
