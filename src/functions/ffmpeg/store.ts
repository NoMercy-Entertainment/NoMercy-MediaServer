import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import M3U8FileParser from 'm3u8-file-parser';
import { join } from 'path';

import { Library } from '../../database/config/client';
import { ArrayElementType, VideoFFprobe, VideoQuality } from '../../encoder/ffprobe/ffprobe';
import { ffmpeg, transcodesPath } from '../../state';
import {
	createBaseFolder, createEpisodeFolder, createFileName, EP, MV
} from '../../tasks/files/filenameParser';
import { convertToHis, createTimeInterval, humanTime } from '../dateTime';
import { unique } from '../stringArray';
import { filenameParse, ParsedFilename, ParsedTvInfo } from '../videoFilenameParser';
import { FFMpeg } from './ffmpeg';
import { isoToName } from './language';

export class Store extends FFMpeg {
	file = '';
	title = '';
	segmentDuration = 4;

	streamMaps: string[] = [];
	library: Library = <Library>{};
	manifestFile = '';
	path = transcodesPath;

	defaultStream = 'YES';

	thumbSize = {
		w: 320,
		h: 180,
	};

	thumbnailsFolder = '';
	previewFiles = '';
	spriteFile = '';
	chaptersFile = '';
	fontsFile = '';

	reader = new M3U8FileParser();
	year = 0;
	seasonNumber: any;
	episodeNumber: any;
	parsedFile: ParsedFilename = <ParsedFilename>{};
	preferredOrder: { [x: string]: any; } = {
		eng: 2,
		jpn: 3,
	};

	allowedLanguages = [
		'eng',
		'jpn',
		'dut',
	];

	isTvShow = this.library!.type == 'tv';

	constructor() {
		super();

		return this;
	}

	toDisk(path: string) {
		mkdirSync(path, { recursive: true });
		this.path = path;

		return this;
	}

	async fromFile(file: string) {
		await this.open(file);

		this.getParsedFileName();

		return this;
	}

	async fromDatabase(data: EP | MV) {
		await this.open(data.File[0].path);

		this.title = data.title;

		this.baseFolder = createBaseFolder(data);

		if ((data as EP).airDate) {
			this.episodeFolder = createEpisodeFolder(data as EP);
		}

		this.fileName = createFileName(data);

		this.toDisk(join(data.File[0].Library.Folders[0].folder!.path, this.baseFolder, this.episodeFolder));

		return this;
	}

	getParsedFileName() {
		const reg: any = /(.*[\\\/])(?<fileName>.*)/u.exec(this.file);
		const fileName: any = reg.groups.fileName;

		// const yearReg: any = yearRegex.exec(this.file);
		const parsedFile: ParsedFilename = filenameParse(fileName, this.isTvShow);
		this.parsedFile = parsedFile;

		this.title = parsedFile?.title;
		this.fileName = fileName;
		this.year = parsedFile!.year!;
		this.seasonNumber = (parsedFile as ParsedTvInfo)?.seasons?.[0] ?? undefined;
		this.episodeNumber = (parsedFile as ParsedTvInfo)?.episodeNumbers?.[0] ?? undefined;

		return parsedFile;
	}

	makeStack() {
		this.manifestFile = join(this.path, `${this.fileName}.m3u8`);

		this.thumbnailsFolder = join(this.path, '/thumbs/');
		this.previewFiles = join(this.path, '/previews.vtt');
		this.spriteFile = join(this.path, '/sprite.webp');
		this.chaptersFile = join(this.path, '/chapters.vtt');
		this.fontsFile = join(this.path, '/fonts.vtt');

		// if (existsSync(this.manifestFile)) {
		//     return this;
		// }

		if (this.streams.video.length > 0) {
			this.addVideoStream(this.streams.video[0], { crf: 23, maxrate: 45000000 });
			this.addVideoStream(this.streams.video[0], { width: Math.floor(1080 * 1.778), height: 1080, crf: 25 });
			// this.addVideoStream(this.streams.video[0], { width: Math.floor(720 * 1.778), height: 720, crf: 25 });
			// this.addVideoStream(this.streams.video[0], { width: Math.floor(480 * 1.778), height: 480, crf: 25 });
			// this.addVideoStream(this.streams.video[0], { width: Math.floor(360 * 1.778), height: 360, crf: 25 });
			// this.addVideoStream(this.streams.video[0], { width: Math.floor(240 * 1.778), height: 240, crf: 25 });

			// this.addVideoStream(this.streams.video[0], { width: 1920, height: 1080, bitrate: 5000, maxrate: 6000, crf: 25 });
			// this.addVideoStream(this.streams.video[0], { width: 1280, height: 720, bitrate: 3000, maxrate: 4000, crf: 25 });
			// this.addVideoStream(this.streams.video[0], { width: 854, height: 480, bitrate: 2000, maxrate: 3000, crf: 25 });
			// this.addVideoStream(this.streams.video[0], { width: 640, height: 360, bitrate: 1000, maxrate: 2000, crf: 25 });
			// this.addVideoStream(this.streams.video[0], { width: 426, height: 240, bitrate: 500, maxrate: 1000, crf: 25 });

		}

		if (this.isHDR) {
			this.createPipe();
		}

		for (const stream of unique(this.streams.audio.sort(this.sortByPriorityKeyed(this.preferredOrder, 'language')), 'language').filter(a => this.allowedLanguages.includes(a.language)) ?? []) {
			this.addAudioStream(stream);
		}

		for (const stream of this.streams.subtitle.filter(a => this.allowedLanguages.includes(a.language)) ?? []) {
			this.addSubtitleStream(stream);
		}

		this.addThumbnailsStream();

		this.makeMasterPlaylist();

		this.makeAttachmentsFile();

		this.makeChapterFile();

		return this;
	}

	addVideoStream(
		stream: ArrayElementType<VideoFFprobe['streams']['video']>,
		quality?: VideoQuality
	) {

		if (quality?.width && quality?.height) {
			stream.width = quality.width;
			stream.height = quality.height;
		}

		this.videoStreams.push({ size: `${stream.width}x${stream.height}`, quality: quality ?? stream });

		if (existsSync(this.getFile([`video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}.m3u8`]))) {
			return this;
		}

		if (this.videoStreams.length > 1) {
			this.isMultiBitrate = true;
		}

		this.addCommand('-map', `0:${stream.index}`);

		if (this.hasGpu) {
			this.addCommand('-c:v', 'h264_nvenc');
		} else {
			this.addCommand('-c:v', 'libx264');
		}

		this.addCommand('-an');
		// .addCommand('-map_metadata', '0')
		// .addCommand('-metadata', `title="${this.title}"`);

		if (quality?.crf) {
			if (this.hasGpu) {
				this.addCommand('-cq:v', quality?.crf);
			} else {
				this.addCommand(`-crf ${quality?.crf}`);
			}
		}

		if (quality?.bitrate) {
			this.addCommand(`-b:v ${quality?.bitrate}`);
			this.addCommand('-bufsize 1M');
		} else {
			this.addCommand('-b:v', '0');
		}

		if (quality?.maxrate) {
			this.addCommand(`-maxrate ${quality?.maxrate}`);
		}

		if (this.isMultiBitrate) {
			this.videoFilters = [];
		}
		if (quality?.height) {
			this.addVideoFilter('scale', `-2:${stream.height}`);
		}

		const framerate = this.getFrameRate();

		this.addVideoFilters()
			.addCommand('-keyint_min', framerate)
			.addCommand('-x264opts', `"keyint=${framerate}:min-keyint=${framerate}:no-scenecut"`)
			.addCommand('-g', framerate)
			.addCommand('-pix_fmt', 'yuv420p');

		if (this.hasGpu) {
			this.addCommand('-preset', 'slow')
				.addCommand('-profile:v', 'high')
				.addCommand('-tune:v', 'hq')
				.addCommand('-rc:v', 'vbr');
		}

		this.addHlsOptions();
		this.addCommand('-bsf:v', 'h264_mp4toannexb');
		this.addCommand('-hls_segment_filename', `video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}_%04d.ts`)
			.addFile([`video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}.m3u8`]);

		return this;
	}

	addHlsOptions() {

		this.addCommand('-f', 'hls')
			.addCommand('-hls_allow_cache', '1')
			.addCommand('-hls_flags', 'independent_segments')
			.addCommand('-hls_playlist_type', 'event')
			.addCommand('-hls_segment_type', 'mpegts')
			.addCommand('-segment_time_delta', '1')
			.addCommand('-hls_list_size', '0')
			.addCommand('-segment_list_type', 'm3u8')
			.addCommand('-hls_time', this.segmentDuration)
			.addCommand('-hls_init_time', this.segmentDuration)
			.addCommand('-start_number', '0')
			.addCommand('-force_key_frames:v', '"expr:gte(t,n_forced*2)"')
			.addCommand('-bsf:v', 'h264_mp4toannexb')
			.addCommand('-use_wallclock_as_timestamps', 1);

		return this;
	}

	addAudioStream(stream: ArrayElementType<VideoFFprobe['streams']['audio']>) {
		this.audioStreams.push(stream.language);

		if (existsSync(this.getFile([`audio_${stream.language}/audio_${stream.language}.m3u8`]))) {
			return this;
		}

		this.addCommand('-map', `0:${stream.index}`);

		this.addCommand('-c:a', 'aac')
			.addCommand('-strict', 2)
			// .addCommand('-ac', 2)

			.addAudioFilters()

			.addCommand(`-metadata:s:a:${this.audioStreams.length}`, `language="${stream.language}"`)
			.addCommand(`-metadata:s:a:${this.audioStreams.length}`, `title="${isoToName(stream.language)}"`);

		this.addHlsOptions();
		this.addCommand('-hls_segment_filename', `audio_${stream.language}/audio_${stream.language}_%04d.ts`)
			.addFile([`audio_${stream.language}/audio_${stream.language}.m3u8`]);

		return this;
	}

	// TODO:
	addSubtitleStream(stream: ArrayElementType<VideoFFprobe['streams']['subtitle']>) {
		const ext = this.getExtension(stream);
		const type = this.getSubType(stream);

		this.subtitleStreams.push(stream.language);

		if (existsSync(this.getFile([`subtitles/${this.fileName}.${stream.language}.${type}.${ext}`]))) {
			return this;
		}

		this.addCommand('-map', `0:${stream.index}`);

		if (ext == 'sup') {
			this.addCommand('-c:s', 'copy');
		} else if (ext == 'ass') {
			this.addCommand('-c:s', 'ass');
		} else {
			this.addCommand('-c:s', 'webvtt');
		}

		this.addFile([`subtitles/${this.fileName}.${stream.language}.${type}.${ext}`]);

		return this;
	}

	setThumbSize(w: number, h: number) {
		this.thumbSize = {
			w: w,
			h: h,
		};

		return this;
	}

	addThumbnailsStream() {

		if (existsSync(this.getFile(['sprite.webp'])) || existsSync(this.getFile(['thumbs/thumb-0100.jpg']))) {
			return this;
		}
		this.thumbnailStreams.push('true');

		if (this.isMultiBitrate) {
			this.videoFilters = [];
		}
		this.addCommand('-c:v', 'mjpeg')
			.addVideoFilter('fps', 'fps=1/10')
			.addVideoFilters()
			.addCommand('-ss 1')
			.addCommand(`-s ${this.thumbSize.w}x${this.thumbSize.h}`)
			.addFile(['thumbs/thumb-%04d.jpg']);

		return this;
	}

	addStreamMap(arg: string) {
		this.streamMaps.push(arg);

		return this;
	}

	buildStreamMaps() {
		const result = this.streamMaps.join(' ');
		this.addCommand('-var_stream_map', `"${result}"`);

		return this;
	}

	makeMasterPlaylist() {
		const m3u8_content: string[] = [];

		m3u8_content.push('#EXTM3U');
		m3u8_content.push('#EXT-X-VERSION:6');

		for (const stream of this.audioStreams ?? []) {
			const arg: string[] = [];

			arg.push('#EXT-X-MEDIA:TYPE=AUDIO');
			arg.push('GROUP-ID="group_audio"');
			arg.push(`NAME="${isoToName(stream)}"`);
			arg.push(`DEFAULT=${this.defaultStream}`);
			arg.push('AUTOSELECT=YES');
			arg.push(`LANGUAGE="${stream}"`);
			arg.push(`URI="audio_${stream}/audio_${stream}.m3u8"`);

			m3u8_content.push(arg.join(','));

			this.defaultStream = 'NO';
		}

		for (const stream of this.videoStreams ?? []) {
			const arg: string[] = [];

			arg.push(`#EXT-X-STREAM-INF:BANDWIDTH=${this.getBitrate(stream.quality)}`);
			arg.push(`RESOLUTION=${stream.size}`);
			arg.push('CODECS="avc1.640028,mp4a.40.2"');
			arg.push('AUDIO="group_audio"');
			arg.push(`LABEL="${stream.size.split('x')[1]}P"`);
			m3u8_content.push(arg.join(','));

			m3u8_content.push(`video_${stream.size}/video_${stream.size}.m3u8`);
		}

		writeFileSync(this.manifestFile, m3u8_content.join('\n'));

		return this;
	}

	buildSprite() {
		if (existsSync(this.spriteFile)) {
			return this;
		}

		const interval = 10;

		const imageFiles = readdirSync(this.thumbnailsFolder).sort();

		if (imageFiles.length == 0) {
			return this;
		}

		const thumbWidth = this.thumbSize.w;
		const thumbHeight = this.thumbSize.h;

		const gridWidth = Math.ceil(Math.sqrt(imageFiles.length));
		const gridHeight = Math.ceil(imageFiles.length / gridWidth);

		const montageCommand = [
			`"${ffmpeg}"`,
			`-i "${`${this.thumbnailsFolder}/thumb-%04d.jpg`}"`,
			`-filter_complex tile="${gridWidth}x${gridHeight}"`,
			`-y "${this.spriteFile}"  2>&1`,
		].join(' ');

		execSync(montageCommand, { maxBuffer: 1024 * 5000 });

		const times = createTimeInterval(this.format.duration, interval);

		let dst_x = 0;
		let dst_y = 0;

		let jpg = 1;
		const line = 1;

		const thumb_content: string[] = ['WEBVTT'];

		times.forEach((time, index) => {
			thumb_content.push(jpg.toString());
			thumb_content.push(`${time} --> ${times[index + 1]}`);
			thumb_content.push(`sprite.webp#xywh=${dst_x},${dst_y},${thumbWidth},${thumbHeight}`);
			thumb_content.push('');
			if (line <= gridHeight) {
				if (jpg % gridWidth == 0) {
					dst_x = 0;
					dst_y += thumbHeight;
				} else {
					dst_x += thumbWidth;
				}
				jpg++;
			}
		});

		writeFileSync(this.previewFiles, thumb_content.join('\n'));

		existsSync(this.thumbnailsFolder) && rmSync(this.thumbnailsFolder, { recursive: true });

		return this;
	}

	makeAttachmentsFile() {
		if (this.attachments && this.attachments.length > 0) {
			const data: any[] = [];

			this.attachments?.map((c) => {
				data.push({
					file: c.filename.toLowerCase(),
					mimeType: c.mimetype,
				});
			});
			writeFileSync(this.fontsFile, JSON.stringify(data));
		}
	}

	makeChapterFile() {

		if (this.chapters && this.chapters.length > 0) {
			const data = ['WEBVTT'];

			this.chapters.map((c) => {
				data.push(
					'',
					`Chapter ${c.index + 1}`,
					`${humanTime(c.start_time)} --> ${convertToHis(c.end_time)}`,
					`${c.title}`
				);
			});

			writeFileSync(this.chaptersFile, data.join('\n'));
		}
	}

	check() {
		console.log(this);
		console.log(this.buildCommand());
		return this;
	}

	clear() {
		return new Store();
	}

	verify() {
		if (this.file.endsWith('.mkv')) {
			return this.verifyMkv();
		}

		if (this.file.endsWith('.mp4')) {
			return this.verifyMP4();
		}

		if (this.file.endsWith('.m3u8')) {
			return this.verifyHLS();
		}
	}

	verifyMP4() {
		return this;
	}

	verifyMkv() {
		return this;
	}

	verifyHLS() {
		const manifestFile = join(this.path, `${this.fileName}.m3u8`);

		if (!existsSync(manifestFile)) {
			console.log(`no manifest: ${this.fileName}.m3u8`);
			return this;
		}

		this.reader.read(readFileSync(manifestFile, 'utf-8'));

		const manifestFileResult = this.reader.getResult();
		this.reader.reset();

		if (!manifestFileResult.media) {
			console.log(`no media: ${this.fileName}.m3u8`);
			return this;
		}
		if (!manifestFileResult.segments) {
			console.log(`no segments: ${this.fileName}.m3u8`);
			return this;
		}
		console.log(`yes: ${this.fileName}.m3u8`);

		for (const segment of manifestFileResult.segments) {

			if (!existsSync(this.getFile([segment.url]))) {
				console.log(`no segment: ${segment.url}`);
				return this;
			}

			this.reader.read(readFileSync(this.getFile([segment.url]), 'utf-8'));

			const result = this.reader.getResult();
			this.reader.reset();

			if (!result.endList) {
				console.log(`no endlist: ${segment.url}`);
				return this;
			}
			console.log(`yes endlist: ${segment.url}`);
		}

		for (const audio of Object.entries(manifestFileResult.media?.AUDIO?.group_audio) ?? []) {
			const item = audio[1] as any;

			this.reader.read(readFileSync(this.getFile([item.uri]), 'utf-8'));

			const result = this.reader.getResult();
			this.reader.reset();

			if (!result.endList) {
				console.log(`no endlist: ${item.uri}`);
				return this;
			}
			console.log(`yes endlist: ${item.uri}`);
		}

		console.log('');

		return this;
	}
}
