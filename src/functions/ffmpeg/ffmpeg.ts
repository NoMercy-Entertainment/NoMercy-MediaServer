import { exec, ExecException, execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import osu from 'os-utils';
import { join } from 'path';

import { ArrayElementType, Audio, VideoFFprobe, VideoQuality } from '../../encoder/ffprobe/ffprobe';
import getVideoInfo from '../../encoder/ffprobe/getVideoInfo';
import { ffmpeg, transcodesPath, userDataPath } from '@/state';

export class FFMpeg {
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
	debug = false;

	videoStreams: { size: string; quality: VideoQuality; }[] = [];
	audioStreams: string[] = [];
	subtitleStreams: string[] = [];
	thumbnailStreams: string[] = [];
	isMultiBitrate = false;

	constructor() {
		this.version = this.#getVersion();
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
			execSync(`${ffmpeg} -hide_banner -init_hw_device opencl=ocl -version 2>&1`)
				.toString('utf-8');
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

		if (this.hasGpu && this.isMultiBitrate) {
			this.addCommand('-i', 'pipe:', true);
		}

		if (!this.debug && this.isMultiBitrate) {
			this.addCommand('-nostats', undefined, true);
			this.addCommand('-progress', '-', true);
		}

		if (this.hasGpu && this.isMultiBitrate) {
			this.addCommand(ffmpeg, undefined, true)
				.addCommand('-', '|', true)
				.addCommand('-f', 'matroska', true);

			this.addCommand('-c:s', 'copy', true)
				.addCommand('-c:a', 'copy', true)
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
		this.addCommand('-y');
		if (!this.debug) {
			this.addCommand('>', `"${join(transcodesPath, `progress_${this.title}.txt`)}" 2>&1`);
		}
		return this;
	}

	onProgress(callback: () => unknown, duration: number | null = null) {
		console.log(duration);
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

	start(cb?: (arg?: any) => unknown) {
		if (this.commands.length == 0) {
			return this;
		}

		const path = join(this.path);
		const command = this.buildCommand();

		if (this.commands.at(-1)?.includes('pipe:')) {
			cb?.();
		} else {
			exec(command, {
				cwd: path,
			}, (error: ExecException | null, stdout: string, stderr: string) => {
				if (error) {
					console.error(error);
				}
				if (stderr) {
					console.error(stderr);
				}

				cb?.();
			});
		}

		return this;
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
			.map(([key, val]) => (
				val
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

		console.log(`${folder}/${path.split(/[\\\/]/u)[0].replace(/\w+\.\w{3,4}$/u, '')}`);

		mkdirSync(`${folder}/${path.split(/[\\\/]/u)[0].replace(/\w+\.\w{3,4}$/u, '')}`, { recursive: true });

		this.addCommand(path);
		return this;
	}

	getHDRFilter() {

		this.isHDR = this.streams.video.some(stream =>
			stream.color_space.includes('bt2020')
			|| stream.color_primaries.includes('bt2020'));

		if (this.lutFile && this.isHDR && !this.#wantsSDR) {
			this.addVideoFilter('lut3d', `"${userDataPath}/${this.lutFile}"`);
			this.addVideoFilter('zscale', 'p=bt709');
			this.addVideoFilter('zscale', 't=bt709:m=bt709:r=tv');
			this.addVideoFilter('eq', 'saturation=0.95');
		}

		if (this.isHDR && !this.#wantsSDR) {

			if (this.hasGpu) {
				this.addPreInputCommand('-vsync', '0');
				this.addPreInputCommand('-extra_hw_frames', '3');
				this.addPreInputCommand('-init_hw_device', 'opencl=ocl');

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

		const crop = execSync(`${ffmpeg} -ss 120 -i "${this.file}" -max_muxing_queue_size 999 -vframes 1000 -vf cropdetect -t 1000 -f null - 2>&1`)
			.toString('utf-8');

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

	getExtension (stream: ArrayElementType<VideoFFprobe['streams']['subtitle']>) {
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

			const first
				= a[key].toString().toLowerCase() in sortingOrder
					? sortingOrder[a[key]]
					: Number.MAX_SAFE_INTEGER;
			const second
				= b[key].toString().toLowerCase() in sortingOrder
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
		return array.reduce(
			(res: { [x: string]: any }, key: string | number, index: number) => {
				res[key] = index + 1;
				return res;
			},
			{}
		);
	};


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
			return Math.floor((this.format.duration * quality.bitrate) / 8 / rate);
		}

		if (this.format.bit_rate && this.format.bit_rate != 'N/A' && this.format.duration) {
			return Math.floor((this.format.duration * this.format.bit_rate) / 8 / rate);
		}

		if (this.format.duration) {
			const size = this.#getTotalSize(this.format.filename.replace(/[\\\/][^\\\/]+(?=.*\w*)$/u, ''));
			return Math.floor(size / this.format.duration / 8 / rate);
		}

		return 520929;
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
	};

}
