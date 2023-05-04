import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import M3U8FileParser from 'm3u8-file-parser';
import { join } from 'path';

import { EncoderProfile, EncoderProfileLibrary, Folder, Library, LibraryFolder, Prisma } from '../../database/config/client';
import { ArrayElementType, VideoFFprobe, VideoQuality } from '../../encoder/ffprobe/ffprobe';
import { dataPath, ffmpeg, transcodesPath } from '@/state';
import {
	createBaseFolder, createEpisodeFolder, createFileName, createTitleSort, EP, MV
} from '../../tasks/files/filenameParser';
import { convertToHis, createTimeInterval, humanTime, parseYear } from '../dateTime';
import { matchPercentage, pad, unique } from '../stringArray';
import { filenameParse, ParsedFilename, ParsedTvInfo } from '../videoFilenameParser';
import { FFMpeg } from './ffmpeg';
import { isoToName } from './language';
import { confDb } from '@/database/config';
import { searchMovie, searchTv } from '@/providers/tmdb/search';

export type EncodingLibrary = (Library & {
	EncoderProfiles: (EncoderProfileLibrary & {
		EncoderProfile: EncoderProfile;
	})[];
	Folders: (LibraryFolder & {
		folder: Folder | null;
	})[];
});

export class FFMpegArchive extends FFMpeg {
	file = '';
	title = '';
	segmentDuration = 4;

	streamMaps: string[] = [];
	qualities: EncoderProfile[] = [];
	manifestFile = '';
	path = transcodesPath;

	defaultStream = 'YES';

	thumbSize = {
		w: 256,
		h: 144,
	};

	reader = new M3U8FileParser();
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

	isTvShow = false;
	filteredAudioStreams: any;
	wantsPlaylist = false;
	mp4File = '';

	episode: EP | null = <EP>{};
	movie: MV | null = <MV>{};

	constructor(context: FFMpegArchive | null = null) {
		super();

		if (context) {
			for (const [key, val] of Object.entries(context)) {
				this[key] = val;
			}
		}

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

		if (this.isTvShow) {

			let currentScore = 0;
			const searchResult = await searchTv(this.title, this.year ?? undefined)
				.then((tvs) => {
					let show = tvs[0];

					if (tvs.length == 1) {
						return show;
					}

					for (const tv of tvs) {
						const newScore = matchPercentage(tv.name, this.title);
						if (newScore > currentScore) {
							currentScore = newScore;
							show = tv;
						}
					}

					return show;
				})
				.catch(() => null);

			if (searchResult) {
				this.episode = await confDb.episode.findFirst({
					where: {
						episodeNumber: this.episodeNumber,
						seasonNumber: this.seasonNumber,
						Tv: {
							titleSort: createTitleSort(searchResult.name, searchResult.first_air_date),
						},
					},
					include: {
						Tv: true,
						Season: true,
						File: {
							include: {
								Library: {
									include: {
										Folders: {
											include: {
												folder: true,
											},
										},
										EncoderProfiles: {
											include: {
												EncoderProfile: true,
											},
										},
									},
								},
							},
						},
					},
				});
			}

			if (!this.episode) {
				throw new Error('Episode not found');
			}

			this.year = parseYear(this.episode.Tv.firstAirDate)!;
			this.baseFolder = createBaseFolder(this.episode);

			if ((this.episode as EP).airDate) {
				this.episodeFolder = createEpisodeFolder(this.episode as EP);
				this.index = this.episode.id;
			}

			this.fileName = createFileName(this.episode);

			this.toDisk(join(this.library.Folders[0].folder!.path, this.baseFolder, this.episodeFolder));

			if (this.episodeNumber % 2 == 0) {
				this.hasGpu = false;
			}
		} else {
			let currentScore = 0;
			const searchResult = await searchMovie(this.title, this.year)
				.then((movies) => {
					let show = movies[0];

					if (movies.length == 1) {
						return show;
					}

					for (const movie of movies) {
						const newScore = matchPercentage(movie.title, this.title);
						if (newScore > currentScore) {
							currentScore = newScore;
							show = movie;
						}
					}
					return show;
				});
			if (searchResult) {
				this.movie = await confDb.movie.findFirst({
					where: {
						titleSort: createTitleSort(searchResult.title, searchResult.release_date),
					},
					include: {
						File: {
							include: {
								Library: {
									include: {
										Folders: {
											include: {
												folder: true,
											},
										},
										EncoderProfiles: {
											include: {
												EncoderProfile: true,
											},
										},
									},
								},
							},
						},
					},
				});
			}

			if (!this.movie) {
				throw new Error('Movie not found');
			}
			this.year = parseYear(this.movie.releaseDate)!;
			this.baseFolder = createBaseFolder(this.movie);
			this.index = this.movie.id;

			this.fileName = createFileName(this.movie);

			this.toDisk(join(this.library.Folders[0].folder!.path, this.baseFolder, this.episodeFolder));

		}

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

	setLibrary(library: EncodingLibrary) {
		this.library = library;
		this.isTvShow = library.type === 'tv';

		return this;
	}

	setAllowedLanguages(languages?: string[]) {
		if (languages && languages.length > 0) {
			this.allowedLanguages = languages;
			return this;
		}

		const data = JSON.parse(readFileSync(join(dataPath, 'languages.json'), 'utf-8'));
		this.allowedLanguages = data.map(lang => lang.iso_639_2_b);
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
		this.mp4File = join(this.path, `${this.fileName}.mp4`);

		this.thumbnailsFolder = join(this.path, '/thumbs/');
		this.previewFiles = join(this.path, '/previews.vtt');
		this.spriteFile = join(this.path, '/sprite.webp');
		this.chaptersFile = join(this.path, '/chapters.vtt');
		this.subtitleFolder = join(this.path, '/subtitles');
		this.fontsFile = join(this.path, '/fonts.vtt');
		this.setAllowedLanguages();

		this.fullTitle = this.seasonNumber && this.episodeNumber && this.episode
			? `${this.title} (${this.year}) S${pad(this.seasonNumber)} E${pad(this.episodeNumber)} - ${this.episode.title}`
			: `${this.title} (${this.year})`;

		this.filteredAudioStreams = unique(this.streams.audio.sort(this.sortByPriorityKeyed(this.preferredOrder, 'language')), 'language')
			.filter(a => this.allowedLanguages.includes(a.language)) ?? [];

		this.wantsPlaylist = this.filteredAudioStreams.length > 1 || this.library.EncoderProfiles.length > 1;

		// if (existsSync(this.manifestFile)) {
		//     return this;
		// }

		for (const profile of this.library.EncoderProfiles) {
			const params = JSON.parse(profile.EncoderProfile.param);
			this.qualities.push(params);
		}

		if (this.isHDR) {
			this.createPipe();
		}

		if ((this.wantsPlaylist && !existsSync(join(this.path, `${this.fileName}.m3u8`)))
		|| (!this.wantsPlaylist && !existsSync(join(this.path, `${this.fileName}.mp4`)))) {
			for (const profile of this.library.EncoderProfiles) {
				const params = JSON.parse(profile.EncoderProfile.param);
				this.addVideoStream(this.streams.video[0], params);
			}

			for (const stream of this.filteredAudioStreams) {
				this.addAudioStream(stream);
			}
		}

		if (!this.wantsPlaylist && !existsSync(join(this.path, `${this.fileName}.m3u8`))) {
			this.addCommand('-bsf:v', 'h264_mp4toannexb');
			this.addCommand('-use_wallclock_as_timestamps 1');
			this.addFile([`${this.fileName}.mp4`]);
		}

		for (const stream of this.streams.subtitle.filter(a => this.allowedLanguages.includes(a.language)) ?? []) {
			this.addSubtitleStream(stream);
		}

		this.addThumbnailsStream();

		if (this.wantsPlaylist && !existsSync(join(this.path, `${this.fileName}.m3u8`))) {
			this.makeMasterPlaylist();
		}

		this.makeAttachmentsFile();

		this.makeChapterFile();

		return this;
	}

	addVideoStream(
		stream: ArrayElementType<VideoFFprobe['streams']['video']>,
		quality: VideoQuality
	) {

		if (quality?.width && quality?.height) {
			stream.width = quality.width;
			stream.height = quality.height;
		}

		this.videoStreams.push({ size: `${stream.width}x${stream.height}`, quality: quality ?? stream });

		if (this.wantsPlaylist) {
			if (existsSync(this.getFile([`video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}.m3u8`]))) {
				return this;
			}
		}

		if (this.videoStreams.length > 1) {
			this.isMultiBitrate = true;
		}

		this.addCommand('-map', `0:${stream.index}`);

		if (this.hasGpu) {
			if (quality.codec == 'H264') {
				this.addCommand('-c:v', 'h264_nvenc');
			} else if (quality.codec == 'H265') {
				this.addCommand('-c:v', 'hevc_nvenc');
			}
		} else if (!this.hasGpu) {
			if (quality.codec == 'H264') {
				this.addCommand('-c:v', 'libx264');
			} else if (quality.codec == 'H265') {
				this.addCommand('-c:v', 'libx265');
			}
		}

		if (this.wantsPlaylist) {
			this.addCommand('-an');
		}

		this.addCommand('-map_metadata', '0')
			.addCommand('-metadata', `title="${this.title}"`);

		if (quality?.crf) {
			if (this.hasGpu) {
				this.addCommand('-cq:v', Math.floor(quality?.crf * 1.12)); // 1.12 is the quality difference between nvenc and libx
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

		if (this.isMultiBitrate || !existsSync(this.getFile(['sprite.webp']))) {
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

		// for (const opt of Object.entries(extra ?? [])) {
		// 	this.addCommand(opt[0], opt[1]);
		// }

		if (this.wantsPlaylist) {
			this.addHlsOptions();
			this.addCommand('-hls_segment_filename', `video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}_%04d.ts`)
				.addFile([`video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}.m3u8`]);
		}

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
			.addCommand('-strict', 2);

		if (this.wantsPlaylist) {
			//
		} else {
			this.addCommand('-ac', 2);
		}

		this.addAudioFilters()
			.addCommand(`-metadata:s:a:${this.audioStreams.length}`, `language="${stream.language}"`)
			.addCommand(`-metadata:s:a:${this.audioStreams.length}`, `title="${isoToName(stream.language)}"`);

		if (this.wantsPlaylist) {
			this.addHlsOptions();
			this.addCommand('-hls_segment_filename', `audio_${stream.language}/audio_${stream.language}_%04d.ts`)
				.addFile([`audio_${stream.language}/audio_${stream.language}.m3u8`]);
		}

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

		// if (this.isMultiBitrate) {
		this.videoFilters = [];
		// }
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
		m3u8_content.push('');

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
		m3u8_content.push('');

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
		return this;
	}

	clear() {
		return new FFMpegArchive();
	}

	verify() {
		if (this.file.endsWith('.mkv')) {
			this.verifyMkv();
			return this;
		}

		if (this.file.endsWith('.mp4')) {
			this.verifyMP4();
			return this;
		}

		if (this.file.endsWith('.m3u8')) {
			this.verifyHLS();
			return this;
		}

		return this;
	}

	verifyMP4() {
		return this;
	}

	verifyMkv() {
		return this;
	}

	verifyHLS() {

		if (!existsSync(this.manifestFile)) {
			console.log(`no manifest: ${this.fileName}.m3u8`);
			return this;
		}

		this.reader.read(readFileSync(this.manifestFile, 'utf-8'));

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

	async addToDatabase() {
		let fileName = '';
		if (this.wantsPlaylist) {
			fileName = `${this.fileName}.m3u8`;
		} else {
			fileName = `${this.fileName}.mp4`;
		}

		if (this.streams?.video) {
			if (this.isTvShow) {
				const videoFileInset = Prisma.validator<Prisma.VideoFileUpdateInput>()({
					filename: `/${fileName}`,
					folder: `/${join(this.baseFolder, this.episodeFolder)}`,
					hostFolder: join(this.path),
					duration: humanTime(this.format.duration),
					quality: JSON.stringify(this.getQualityTag(this.qualities)),
					share: this.library.id,
					subtitles: JSON.stringify(this.getExistingSubtitles(this.subtitleFolder)),
					languages: JSON.stringify(this.streams.audio.map(a => a.language)),
					Chapters: JSON.stringify(this.chapters),
					Episode: {
						connect: {
							id: this.episode?.id,
						},
					},
				});

				await confDb.videoFile.upsert({
					where: {
						episodeId: this.episode?.id,
					},
					create: videoFileInset,
					update: videoFileInset,
				});

				const tv = await confDb.tv.findFirst({
					where: {
						Episode: {
							some: {
								id: this.episode?.id,
							},
						},
					},
				})!;

				await confDb.tv.update({
					where: {
						id: tv?.id,
					},
					data: {
						haveEpisodes: (tv?.haveEpisodes ?? 0) + 1,
					},
				});
			} else {
				const videoFileInset = Prisma.validator<Prisma.VideoFileUpdateInput>()({
					filename: `/${fileName}`,
					folder: `/${join(this.baseFolder, this.episodeFolder)}`,
					hostFolder: join(this.path),
					duration: humanTime(this.format.duration),
					quality: JSON.stringify(this.getQualityTag(this.qualities)),
					share: this.library.id,
					subtitles: JSON.stringify(this.getExistingSubtitles(this.subtitleFolder)),
					languages: JSON.stringify(this.streams.audio.map(a => a.language)),
					Chapters: JSON.stringify(this.chapters),
					Movie: {
						connect: {
							id: this.movie?.id,
						},
					},
				});

				await confDb.videoFile.upsert({
					where: {
						movieId: this.movie?.id,
					},
					create: videoFileInset,
					update: videoFileInset,
				});
			}
			await Promise.all([]);
		}

		return this;
	}
}
