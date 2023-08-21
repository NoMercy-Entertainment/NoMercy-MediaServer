import { ExecException, exec, execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

import { ArrayElementType, VideoFFprobe, VideoQuality } from '../../encoder/ffprobe/ffprobe';
import { dataPath, ffmpeg, transcodesPath } from '@server/state';
import {
	EP,
	MV,
	createBaseFolder, createEpisodeFolder, createFileName, createTitleSort
} from '@server/tasks/files/filenameParser';
import { convertToHis, createTimeInterval, humanTime, parseYear } from '../dateTime';
import { matchPercentage, pad, unique } from '../stringArray';
import { filenameParse, ParsedFilename, ParsedTvInfo } from '../videoFilenameParser';
import { FFMpeg } from './ffmpeg';
import { isoToName } from './language';
import { searchMovie, searchTv } from '@server/providers/tmdb/search';
import findMediaFiles from '@server/tasks/data/files';
import { and, eq } from 'drizzle-orm';
import { movies } from '@server/db/media/schema/movies';
import { episodes } from '@server/db/media/schema/episodes';
import { EncodingLibrary } from '@server/db/media/actions/libraries';
import { insertVideoFileDB } from '@server/db/media/actions/videoFiles';
import i18next from 'i18next';
import { convertBooleans } from '@server/db/helpers';
import { Movie } from '@server/providers/tmdb/movie';

export class FFMpegArchive extends FFMpeg {
	file = '';
	title = '';
	segmentDuration = 4;

	streamMaps: string[] = [];
	path = transcodesPath;

	defaultStream = 'YES';

	thumbSize = {
		w: 256,
		h: 144,
	};

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

	episode: ReturnType<typeof this.findEpisode>;
	movie: ReturnType<typeof this.findMovie>;

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

	findEpisode(id: number, seasonNumber: number, episodeNumber: number) {
		return globalThis.mediaDb.query.episodes.findFirst({
			where: and(
				eq(episodes.episodeNumber, episodeNumber),
				eq(episodes.seasonNumber, seasonNumber),
				eq(episodes.tv_id, id)
			),
			with: {
				tv: {
					with: {
						library: {
							with: {
								folder_library: {
									with: {
										folder: true,
									},
								},
								encoderProfile_library: {
									with: {
										encoderProfile: true,
									},
								},
							},
						},
					},
				},
			},
		});
	}

	findMovie(searchResult: Movie) {
		return globalThis.mediaDb.query.movies.findFirst({
			where: eq(movies.titleSort, createTitleSort(searchResult.title, searchResult.release_date)),
			with: {
				library: {
					with: {
						folder_library: {
							with: {
								folder: true,
							},
						},
						encoderProfile_library: {
							with: {
								encoderProfile: true,
							},
						},
					},
				},
			},
		});
	}

	async fromFile(file: string) {
		await this.open(file);

		this.getParsedFileName();

		if (this.isTvShow) {

			let currentScore = 0;
			await i18next.changeLanguage('en');
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
				this.episode = this.findEpisode(searchResult.id, this.seasonNumber, this.episodeNumber);
			}

			if (!this.episode) {
				throw new Error('Episode not found');
			}

			this.year = parseYear(this.episode.tv.firstAirDate as string)!;
			this.baseFolder = createBaseFolder(this.episode);

			if (this.episode.airDate) {
				this.episodeFolder = createEpisodeFolder(this.episode);
				this.index = this.episode.id;
			}

			this.fileName = createFileName(this.episode);

			this.toDisk(join(this.library.folder_library[0].folder!.path as string, this.baseFolder, this.episodeFolder));

			if (this.episodeNumber % 2 == 0) {
				this.hasGpu = false;
			}
		} else {
			let currentScore = 0;
			await i18next.changeLanguage('en');
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
				this.movie = this.findMovie(searchResult);
			}

			if (!this.movie) {
				throw new Error('Movie not found');
			}
			this.year = parseYear(this.movie.releaseDate)!;
			this.baseFolder = createBaseFolder(this.movie);
			this.index = this.movie.id;

			this.fileName = createFileName(this.movie);

			this.toDisk(join(this.library.folder_library[0].folder!.path as string, this.baseFolder, this.episodeFolder));

		}

		this.share = this.library.folder_library[0].folder.id ?? '';

		return this;
	}

	async fromDatabase(data: EP | MV) {
		await this.open(data.files[0].library.folder_library[0].folder.path as string);

		this.title = data.title as string;

		this.baseFolder = createBaseFolder(data);

		if ((data as EP).airDate) {
			this.episodeFolder = createEpisodeFolder(data as EP);
		}

		this.fileName = createFileName(data);

		this.toDisk(join(data.files[0].library.folder_library[0].folder.path as string, this.baseFolder, this.episodeFolder));

		this.share = this.library.folder_library[0].folder.id ?? '';

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
		this.seasonNumber = (parsedFile as ParsedTvInfo)?.seasons?.[0] ?? 1;
		this.episodeNumber = (parsedFile as ParsedTvInfo)?.episodeNumbers?.[0] ?? undefined;

		return parsedFile;
	}

	async makeStack() {
		this.manifestFile = join(this.path, `${this.fileName}.m3u8`);
		this.mp4File = join(this.path, `${this.fileName}.mp4`);

		this.thumbnailsFolder = join(this.path, '/thumbs/');
		this.previewFiles = join(this.path, '/previews.vtt');
		this.spriteFile = join(this.path, '/sprite.webp');
		this.chaptersFile = join(this.path, '/chapters.vtt');
		this.subtitleFolder = join(this.path, '/subtitles');
		this.fontsFolder = join(this.path, '/fonts/');
		this.fontsFile = join(this.path, '/fonts.json');
		this.setAllowedLanguages();

		mkdirSync(this.subtitleFolder, { recursive: true });

		this.fullTitle = this.seasonNumber != null && this.episodeNumber && this.episode
			? `${this.title} (${this.year}) S${pad(this.seasonNumber)} E${pad(this.episodeNumber)} - ${this.episode.title}`
			: `${this.title} (${this.year})`;

		this.filteredAudioStreams = unique(this.streams.audio.sort(this.sortByPriorityKeyed(this.preferredOrder, 'language')), 'language')
			.filter(a => this.allowedLanguages.includes(a.language)) ?? [];

		for (const profile of this.library.encoderProfile_library) {
			const params = JSON.parse(profile.encoderProfile.param as string);
			if (params.width == this.streams.video[0].width || this.streams.video[0].width - 100 > params.width) {
				this.qualities.push(params);
			}
		}

		if (this.qualities.length == 0) {
			this.qualities.push({
				width: this.streams.video[0].width,
				height: this.streams.video[0].height,
				crf: 23,
				codec: 'H264',
			});
		}

		this.wantsPlaylist = this.filteredAudioStreams.length > 1 || this.qualities.length > 1;

		if (this.qualities.length > 1) {
			this.isMultiBitrate = true;
		}


		if (this.isHDR) {
			this.createPipe();
		}

		if (this.wantsPlaylist) {
			this.verifyHLS();

			for (const quality of this.qualities) {
				this.addVideoStream(this.streams.video[0], quality);
			}
		} else {
			await this.verifyMP4();

			if (existsSync(this.mp4File)) {
				return this;
			}
			for (const quality of this.qualities.slice(0, 1)) {
				this.addVideoStream(this.streams.video[0], quality);
			}
		}

		for (const stream of this.filteredAudioStreams) {
			this.addAudioStream(stream);
		}

		if (!this.wantsPlaylist) {
			this.addCommand('-bsf:v', 'h264_mp4toannexb');
			this.addCommand('-use_wallclock_as_timestamps 1');
			this.addFile([`${this.fileName}.mp4`]);
		}

		this.addThumbnailsStream();

		if (this.wantsPlaylist && !existsSync(join(this.path, `${this.fileName}.m3u8`))) {
			this.makeMasterPlaylist();
		}

		this.makeChapterFile();

		return this;
	}

	addVideoStream(
		stream: ArrayElementType<VideoFFprobe['streams']['video']>,
		quality: VideoQuality
	) {

		if (quality?.width) {
			stream.width = quality.width;
			stream.height = quality.height || (quality.width / 16) * 9;
		}
		console.log({ size: `${stream.width}x${stream.height}`, quality: quality ?? stream });

		this.videoStreams.push({ size: `${stream.width}x${stream.height}`, quality: quality ?? stream });

		if (this.wantsPlaylist) {
			if (existsSync(this.getFile([`video_${stream.width}x${stream.height}/video_${stream.width}x${stream.height}.m3u8`]))) {
				return this;
			}
		}

		this.addCommand('-map', `0:${stream.index}`);

		if (this.isHDR && this.hasGpu) {
			if (quality.codec == 'H264') {
				this.addCommand('-c:v', 'h264_nvenc');
			} else if (quality.codec == 'H265') {
				this.addCommand('-c:v', 'hevc_nvenc');
			}
		} else if (quality.codec == 'H264') {
			this.addCommand('-c:v', 'libx264');
		} else if (quality.codec == 'H265') {
			this.addCommand('-c:v', 'libx265');
		}

		if (this.wantsPlaylist) {
			this.addCommand('-an');
		}

		this.addCommand('-map_metadata', '0')
			.addCommand('-metadata', `title="${this.title}"`);

		if (quality?.crf) {
			if (this.isHDR && this.hasGpu) {
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

		// if (this.isMultiBitrate || !existsSync(this.getFile(['sprite.webp']))) {
		// 	this.videoFilters = [];
		// }
		if (quality?.height) {
			this.addVideoFilter('scale', `-2:${quality.height}`);
		} else if (quality?.width) {
			this.addVideoFilter('scale', `${quality.width}:-2`);
		}

		const framerate = this.getFrameRate();

		this.addVideoFilters()
			.addCommand('-keyint_min', framerate)
			.addCommand('-x264opts', `"keyint=${framerate}:min-keyint=${framerate}:no-scenecut"`)
			.addCommand('-g', framerate)
			.addCommand('-pix_fmt', 'yuv420p');

		if (this.isHDR && this.hasGpu) {
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

		// if (this.wantsPlaylist) {
		// 	if (stream.channels < 5) {
		// 		this.addCommand('-ac', stream.channels);
		// 	}
		// } else {
		this.addCommand('-ac', 2);
		// }

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

	async makeSubtitles() {
		this.commands = [];

		for (const stream of this.streams.subtitle ?? []) {
			this.addSubtitleStream(stream);
		}

		await this.start();

		this.convertSubsToVtt();

		this.makeAttachmentsFile();

		const attatchmentsCommand = `"${ffmpeg}" -dump_attachment:t "" -i "${this.format.filename}" -y  -hide_banner -max_muxing_queue_size 9999 -async 1 -loglevel panic 2>&1`;

		if (this.attachments.length > 0) {
			mkdirSync(this.fontsFolder, { recursive: true });
		}

		exec(attatchmentsCommand, {
			cwd: this.fontsFolder,
			maxBuffer: Infinity,
		}, (error: ExecException | null) => {
			if (!error) {
				if (!existsSync(this.fontsFile)) return;

				JSON.parse(readFileSync(this.fontsFile, 'utf8')).forEach((font: { file: string; }) => {
					if (existsSync(this.fontsFolder + font.file)) {
						renameSync(this.fontsFolder + font.file, this.fontsFolder + font.file.toLowerCase());
					}
				});
			}
		});

	}

	addSubtitleStream(stream: ArrayElementType<VideoFFprobe['streams']['subtitle']>) {
		const ext = this.getExtension(stream);
		const type = this.getSubType(stream);

		this.subtitleStreams.push(stream.language);

		if (existsSync(this.getFile([`subtitles/${this.fileName}.${stream.language}.${type}.${ext}`]))) {
			return this;
		}

		this.addCommand('-map', `0:${stream.index}`);

		if (ext == 'sup' || ext == 'sub') {
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

		if (existsSync(this.getFile(['sprite.webp'])) || existsSync(this.getFile(['thumbs/thumb-0010.jpg']))) {
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
			arg.push('GROUP-ID="audio"');
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
			arg.push('AUDIO="audio"');
			arg.push(`LABEL="${stream.size.split('x')[1]}P"`);
			m3u8_content.push(arg.join(','));

			m3u8_content.push(`video_${stream.size}/video_${stream.size}.m3u8`);
		}

		writeFileSync(this.manifestFile, m3u8_content.join('\n'));

		return this;
	}

	buildSprite() {
		if (existsSync(this.spriteFile) || !existsSync(this.thumbnailsFolder)) {
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

		const times = createTimeInterval((this.format.duration as number), interval);

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

		if (existsSync(this.thumbnailsFolder)) {
			rmSync(this.thumbnailsFolder, { recursive: true });
		}

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

	async verify() {
		if (this.file.endsWith('.mkv')) {
			this.verifyMkv();
			return this;
		}

		if (this.file.endsWith('.mp4')) {
			await this.verifyMP4();
			return this;
		}

		if (this.file.endsWith('.m3u8')) {
			this.verifyHLS();
			return this;
		}

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

				insertVideoFileDB({
					filename: `/${fileName}`,
					folder: `/${join(this.baseFolder, this.episodeFolder)}`,
					hostFolder: join(this.path),
					duration: humanTime(this.format.duration),
					quality: JSON.stringify(this.getQualityTag(this.qualities)),
					share: this.share,
					subtitles: JSON.stringify(this.getExistingSubtitles()),
					languages: JSON.stringify(this.streams.audio.map(a => a.language)),
					chapters: JSON.stringify(this.chapters),
					episode_id: this.episode?.id,
				});

				await findMediaFiles({
					type: this.library.type,
					data: this.episode?.tv ?? this.movie,
					folder: join(this.library.folder_library[0].folder!.path as string, this.baseFolder),
					libraryId: this.library.id,
					sync: true,
				});

				// const tv = await confDb.tv.findFirst({
				// 	where: {
				// 		Episode: {
				// 			some: {
				// 				id: this.episode?.id,
				// 			},
				// 		},
				// 	},
				// })!;

				// await confDb.tv.update({
				// 	where: {
				// 		id: tv?.id,
				// 	},
				// 	data: {
				// 		haveEpisodes: (tv?.haveEpisodes ?? 0) + 1,
				// 	},
				// });
			} else {
				insertVideoFileDB({
					filename: `/${fileName}`,
					folder: `/${join(this.baseFolder, this.episodeFolder)}`,
					hostFolder: join(this.path),
					duration: humanTime(this.format.duration),
					quality: JSON.stringify(this.getQualityTag(this.qualities)),
					share: this.share,
					subtitles: JSON.stringify(this.getExistingSubtitles()),
					languages: JSON.stringify(this.streams.audio.map(a => a.language)),
					chapters: JSON.stringify(this.chapters),
					movie_id: this.movie?.id,
				});

				if (this.movie?.id) {
					globalThis.mediaDb.update(movies)
						.set({
							...convertBooleans({
								duration: humanTime(this.format.duration),
								show: true,
							}),
						})
						.where(eq(movies.id, this.movie?.id))
						.returning()
						.get();
				}

			}
			await Promise.all([]);
		}

		return this;
	}

	extractSubs() {

		if (this.streams?.subtitle) {
			const subs = this.streams.subtitle.filter(s => s.codec_name == 'hdmv_pgs_subtitle' || s.codec_name == 'dvd_subtitle');

			if (subs.length > 0) {
				if (existsSync(this.getFile(['subtitles', `${this.fileName}.${subs[0].language}.sup`]))) return;

				const subCommand = [
					`"${ffmpeg}"`,
					`-i "${this.format.filename}"`,
					'-map 0:s:0',
					'-c:s copy',
					'-y',
					`"${this.getFile(['subtitles', `${this.fileName}.${subs[0].language}.sup`])}"`,
				].join(' ');

				execSync(subCommand, { maxBuffer: 1024 * 5000 });
			}
		}

		return this;
	}
}
