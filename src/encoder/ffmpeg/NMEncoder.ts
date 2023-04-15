import { exec, execSync } from 'child_process';
import {
	existsSync, mkdirSync, PathLike, readdirSync, readFileSync, rmSync, statSync, writeFileSync
} from 'fs';

import { confDb } from '../../database/config';
import {
	EncoderProfile, EncoderProfileLibrary, Episode, File, Folder, Library, LibraryFolder, Movie, Tv
} from '../../database/config/client';
import getVideoInfo from '../../encoder/ffprobe/getVideoInfo';
import { convertToHis, createTimeInterval, humanTime } from '../../functions/dateTime';
import { pad, unique } from '../../functions/stringArray';
import { filenameParse, ParsedFilename, ParsedTvInfo } from '../../functions/videoFilenameParser';
import { ffmpeg, languagesFile } from '@/state';
import { cleanFileName, yearRegex } from '../../tasks/files/filenameParser';
import { VideoFFprobe } from '../ffprobe/ffprobe';

interface Quality {
    width: number;
    height: number;
    bitrate: number;
    crf: number;
}

type FileData = (File & {
    Library: LibraryData | undefined;
    Episode?: (Episode & {
        Tv: Tv;
    }) | null | undefined;
    Movie?: Movie | null;
}) | null | undefined;


type LibraryData = (Library & {
    folders?: (LibraryFolder & {
        folder: Folder | null;
    })[] | undefined;
    encoderProfiles?: (EncoderProfileLibrary & {
        EncoderProfile: EncoderProfile;
    })[] | null | undefined;
}) | null | undefined;

export class NMEncoder {

	#input: File | string;
	libraryId: string | null;

	#ffprobe: VideoFFprobe = <VideoFFprobe>{};
	width: number | undefined;
	height: number | undefined;
	outputFolder: string | undefined;

	type: 'movie' | 'episode' | 'song' | undefined;

	format: VideoFFprobe['format'] | undefined;
	chapters: VideoFFprobe['chapters'];
	video: VideoFFprobe['streams']['video'] | undefined;
	audio: VideoFFprobe['streams']['audio'] | undefined;
	subtitle: VideoFFprobe['streams']['subtitle'] | undefined;
	attachments: VideoFFprobe['streams']['attachments'] | undefined;

	thumbSize = {
		w: 158,
		h: 90,
	};

	folder: string | undefined;
	seasonNumber: number | null | undefined;
	episodeNumber: number | null | undefined;
	episodeFolder: string | undefined;
	name: string | undefined;
	extension: string | undefined;
	year: number | null | undefined;
	id: string | undefined;
	path: string | undefined;
	title: string | undefined;
	file: string;
	#file: FileData = <FileData>{};
	Episode: (Episode & { Tv: Tv; }) | null | undefined;
	Movie: Movie | null | undefined;

	library: LibraryData | undefined;

	#queryParams = {
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
		Episode: {
			include: {
				Tv: true,
			},
		},
		Movie: true,
	};

	filename: any;

	constructor(input: File | string, libraryId: string | null = null) {
		this.#input = input;
		this.libraryId = libraryId;
		this.file = (this.#input as File)?.path ?? (this.#input as string);

		return (async (): Promise<NMEncoder> => {
			if (typeof input == 'string') {
				await this.getDataByString();
			} else {
				await this.getDataByLibrary();
			}
			await this.getParsedFileName();
			return this;
		})() as unknown as NMEncoder;
	}

	async getDataByString() {
		const data = await confDb.file
			.findFirst({
				where: {
					path: this.#input as string,
				},
				include: this.#queryParams,
			});

		if (data) {
			this.#file = data;
			this.library = data.Library;
			this.type = this.#file?.Episode
				? 'episode'
				: this.#file?.Movie
					? 'movie'
				// eslint-disable-next-line no-constant-condition
					: false
						? 'song'
						: undefined;
			this.setFfprobe(JSON.parse(this.#file?.ffprobe ?? ''));
			this.data();
		} else {
			await this.findLibrary();
			this.#ffprobe = await getVideoInfo(this.#input as string);
			this.setFfprobe(this.#ffprobe);
		}
	}

	async getDataByLibrary() {
		const data = await confDb.file
			.findFirst({
				where: {
					libraryId: this.libraryId ?? (this.#input as File).libraryId,
				},
				include: this.#queryParams,
			});

		if (data) {
			this.#file = data;
			this.library = data.Library;
			this.type = this.#file?.Episode
				? 'episode'
				: this.#file?.Movie
					? 'movie'
				// eslint-disable-next-line no-constant-condition
					: false
						? 'song'
						: undefined;
			this.setFfprobe(JSON.parse(this.#file?.ffprobe ?? ''));
			this.data();
		} else {
			await this.findLibrary();
			this.#ffprobe = await getVideoInfo(this.#input as string);
			this.setFfprobe(this.#ffprobe);
		}
	}

	async findLibrary() {
		this.library = (await confDb.file
			.findFirst({
				where: {
					libraryId: this.libraryId!,
				},
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
			}))?.Library;

	}

	setFfprobe(ffprobe) {
		this.format = ffprobe.format;
		this.chapters = ffprobe.chapters;
		this.video = ffprobe.streams.video;
		this.audio = ffprobe.streams.audio;
		this.subtitle = ffprobe.streams.subtitle;
		this.attachments = ffprobe.streams.attachments;
	}

	data() {
		this.folder = this.#file?.folder;
		this.seasonNumber = this.#file?.seasonNumber;
		this.episodeNumber = this.#file?.episodeNumber;
		this.episodeFolder = this.#file?.episodeFolder;
		this.name = this.#file?.name;
		this.extension = this.#file?.extension;
		this.year = this.#file?.year;
		this.id = this.#file?.id;
		this.path = this.#file?.path;
		this.title = this.#file?.title;
		this.Episode = this.#file?.Episode;
		this.Movie = this.#file?.Movie;
		this.libraryId = this.libraryId ?? (this.#input as File).libraryId;
	}

	async getParsedFileName() {
		const reg: any = /(.*[\\\/])(?<fileName>.*)/u.exec(this.file);
		const fileName: any = reg.groups.fileName;

		const yearReg: any = yearRegex.exec(this.file);
		const parsedFile: ParsedFilename = await filenameParse(fileName, this.library!.type == 'tv');

		this.title = parsedFile?.title;
		this.filename = fileName;
		this.year = parseInt(yearReg?.groups?.year, 10);
		this.seasonNumber = (parsedFile as ParsedTvInfo)?.seasons[0] ?? undefined;
		this.episodeNumber = (parsedFile as ParsedTvInfo)?.episodeNumbers[0] ?? undefined;

		return parsedFile;
	}

	// getters


	getQualityTag() {
		const sizes = this.video?.map((s) => {
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

	getCrop() {
		const crop: any = execSync(
			`${ffmpeg} -ss 0 -i "${this.file}" -max_muxing_queue_size 999 -vframes 1000 -vf cropdetect -t 2000 -f null - 2>&1`
		).toString();

		const crops: any = {};
		const regex = /crop=(\d+:\d+:\d+:\d+)$/gmu;
		let m: any;
		while ((m = regex.exec(crop)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex += 1;
			}
			m.forEach((match, groupIndex) => {
				if (groupIndex == 1) {
					const crop = match;
					crops[crop] = (crops[crop] || 0) + 1;
				}
			});
		}
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

	wantPlaylist() {
		const profiles = this.#file?.Library?.encoderProfiles;

		if (profiles && profiles?.length > 1) {
			return true;
		}
		if (unique(this.audio ?? [], 'language').length > 1) {
			return true;
		}
		if (this.video?.some(v => v.width > 2000) && profiles?.some(p => JSON.parse(p.EncoderProfile?.param ?? '').width > 2000)) {
			return true;
		}
		// if (this.video?.some(v => v.hdr)) {
		//     return true;
		// }

		return false;
	}

	tonemap() {
		// if (lutFile) {
		//     return `,lut3d=${lutFile},scale_cuda=-1:-1:out_color_matrix=bt709`;
		// }

		return ',format=p010,hwupload,tonemap_opencl=tonemap=mobius:param=0.01:desat=0:r=tv:p=bt709:t=bt709:m=bt709:format=nv12,hwdownload,format=nv12';

		return ',zscale=tin=smpte2084:min=bt2020nc:pin=bt2020:rin=tv:t=smpte2084:m=bt2020nc:p=bt2020:r=tv,zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,eq=saturation=0.85';
	}

	videoFilter(stream) {
		const crop = this.getCrop();

		if (stream.hdr == true) {
			return `crop=${crop} ${this.tonemap()}`;
		}

		return `crop=${crop}`;
	}

	spriteFilter(stream) {
		if (stream.hdr == true) {
			return `-vf fps=fps=1/10,${this.tonemap()}`;
		}
		return '-vf fps=fps=1/10';
	}

	getBitrate(quality: { width: number; height: number }) {
		let rate;
		if (quality.width >= 600 && quality.width < 1200) {
			rate = 1024 * 5;
		} else if (quality.width >= 1200 && quality.width < 1900) {
			rate = 1024 * 4;
		} else if (quality.width >= 1900 && quality.width < 2000) {
			rate = 1024 * 3;
		} else if (quality.width >= 2000 && quality.width < 3000) {
			rate = 1024 * 2;
		} else if (quality.width >= 3000) {
			rate = 1024 * 1;
		}

		if (this.format!.bit_rate && this.format!.duration) {
			return Math.floor((this.format!.duration * this.format!.bit_rate) / 8 / rate);
		}
		if (
            this.format!.bit_rate
            && !!Number(this.format!.bit_rate)
            && this.format!.duration
		) {
			return Math.floor(
				(this.format!.duration * this.format!.bit_rate) / 8 / rate
			);
		}
		if (this.format!.duration) {
			const size = this.getTotalSize(
                this.format!.filename.replace(/[\\\/][^\\\/]+(?=.*\w*)$/u, '')
			);
			return Math.floor(size / this.format!.duration / 8 / rate);
		}

		return 520929;
	}

	getTotalSize(dir: PathLike) {
		let totalSize = 0;
		if (existsSync(dir) && statSync(dir).isDirectory()) {
			const files = readdirSync(dir);
			files.forEach((file) => {
				totalSize += statSync(`${dir}/${file}`).size;
			});
		}
		return totalSize;
	}

	getQualities() {
		const qualities: Quality[] = [];
		for (const p of this.library?.encoderProfiles ?? []) {
			const profile = p.EncoderProfile;
			const params: { key: string; val: string }[] = JSON.parse(profile.param);

			const aspect = this.video![0]!.display_aspect_ratio.split(':');

			const width = params.find(p => p.key.includes('s'))?.val.split(':') ?? 0;
			const height = width[1] == '-2'
				? (Number(width[0]) * (Number(aspect[1]) / Number(aspect[0])))
				: Number(width[1]) ?? '-2';
			const bitrate = this.getBitrate({ width: Number(width[0]), height: Number(width[1]) });

			qualities.push({
				bitrate: bitrate,
				width: Number(width[0]),
				height: height,
				crf: Number(params.find(p => p.key.includes('crf'))?.val),

			});
		}

		return qualities;
	}

	isoToName(iso: string) {
		const data = JSON.parse(
			readFileSync(languagesFile, 'utf-8')
		);

		const name = data.filter(n => n.iso_639_2_b == iso);

		if (!name[0]) {
			return 'und';
		}

		return name[0].english_name;
	}

	baseFolderName() {
		const baseName = `${this.title}.(${this.year!})`;

		return cleanFileName(baseName);
	}

	folderName() {
		let showName;

		if (this.type == 'movie') {
			showName = `${this.title}.(${this.year!})`;
		} else {
			showName = `${this.title}.S${pad(this.seasonNumber!, 2)}E${pad(this.episodeNumber!, 2)}`;
		}
		return cleanFileName(showName);
	}

	fileName() {

		let showName;
		let fileName;

		const title = this.title!.substring(0, 100);

		if (this.type == 'movie') {
			fileName = `${this.title}.(${this.year!})`;
		} else {
			showName = `${this.title}.S${pad(this.seasonNumber!, 2)}E${pad(this.episodeNumber!, 2)}`;
			fileName = showName + (this
				? `.${title}`
				: '').replace(/\//gu, '.');
		}

		return cleanFileName(fileName);
	}

	// setters

	setSize(width: number, height: number) {
		this.width = width;
		this.height = height;
		return this;
	}


	// video


	createVideoMap() {
		//
	}


	// audio


	createAudioMap() {
		//
	}


	// subtitle

	createSubtitleMap() {
		//
	}


	// image

	createSpriteMap() {
		if (!this.format?.duration) return;

		const thumbailsFolder = `${this.outputFolder}thumbs/`;
		const spriteFile = `${this.outputFolder}sprite.webp`;
		const thumbMap: any[] = [];
		const vf = this.spriteFilter(this.video![0]);

		if (
			!existsSync(spriteFile)
            && !existsSync(
            	`${thumbailsFolder}thumb-${pad(
            		Math.floor(Math.floor(Number(this.format.duration)) / 10) - 1,
            		4
            	)}.jpg`
            )
		) {
			mkdirSync(thumbailsFolder, { recursive: true });
			thumbMap.push('-c:v mjpeg');
			thumbMap.push(vf);
			thumbMap.push('-ss 1');
			thumbMap.push(`-s ${this.thumbSize.w}x${this.thumbSize.h}`);
			thumbMap.push(`"${this.outputFolder}thumbs/thumb-%04d.jpg"`);

			// this.log.push(' thumbnails ');
		}
		return thumbMap;
	}


	// File makers

	async makeThumbnailsFile() {
		if (!this.format?.duration) return;

		const thumbailsFolder = `${this.outputFolder}thumbs/`;
		const previewFiles = `${this.outputFolder}previews.vtt`;
		const spriteFile = `${this.outputFolder}sprite.webp`;

		if (!existsSync(spriteFile) && existsSync(thumbailsFolder)) {
			const thumbWidth = this.thumbSize.w;
			const thumbHeight = this.thumbSize.h;
			let imageFiles = readdirSync(thumbailsFolder).sort();
			const thumb_content: any[] = [];

			let dst_x = 0;
			let dst_y = 0;
			const interval = 10;

			const imageCount = imageFiles.length;
			const imageLine = Math.ceil(Math.sqrt(imageCount));
			const maxLines = Math.ceil(imageCount / imageLine);

			if (imageCount > 0) {
				const montageCommand = [
					`"${ffmpeg}"`,
					`-i "${thumbailsFolder}thumb-%04d.jpg"`,
					`-filter_complex tile="${imageLine}x${maxLines}"`,
					`-y "${spriteFile}"`,
					'2>&1',
				].join(' ');
				imageFiles = imageFiles.sort();

				const times = createTimeInterval(Number(this.format.duration), interval);

				let jpg = 1;
				const line = 1;

				thumb_content.push('WEBVTT');
				times.forEach((time, index) => {
					thumb_content.push(jpg);
					thumb_content.push(`${time} --> ${times[index + 1]}`);
					thumb_content.push(
						`sprite.webp#xywh=${dst_x},${dst_y},${thumbWidth},${thumbHeight}`
					);
					thumb_content.push('');
					if (line <= maxLines) {
						if (jpg % imageLine == 0) {
							dst_x = 0;
							dst_y += thumbHeight;
						} else {
							dst_x += thumbWidth;
						}
						jpg += 1;
					}
				});

				writeFileSync(previewFiles, thumb_content.join('\n'));

				await new Promise((resolve) => {
					exec(montageCommand, { maxBuffer: 1024 * 5000 }, () => {
						existsSync(thumbailsFolder)
                            && rmSync(thumbailsFolder, { recursive: true });
					});
					resolve(null);
				});
			}
		}
	}

	makeAttachmentsFile() {
		const attachmentsFile = `${this.outputFolder}/fonts.json`;

		if (this.attachments && this.attachments.length > 0) {
			const data: any[] = [];

			this.attachments?.map((c) => {
				data.push({
					file: c.filename.toLowerCase(),
					mimeType: c.mimetype,
				});
			});
			writeFileSync(attachmentsFile, JSON.stringify(data));
		}
	}

	makeChaperfile() {
		const chapterFile = `${this.outputFolder}/chapters.vtt`;

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

			writeFileSync(chapterFile, data.join('\n'));
		}
	}

	makeManifestFile() {
		if (this.wantPlaylist()) {
			const languages: any[] = [];

			if (this.outputFolder && !existsSync(this.outputFolder!)) {
				mkdirSync(this.outputFolder!);
			}

			const manifestFile = `${this.outputFolder}/manifest.m3u8`;

			console.log(`Creating manifest file: ${manifestFile}`);

			const m3u8_content: any[] = [];
			let def = 'YES';

			m3u8_content.push('#EXTM3U');
			m3u8_content.push('');

			unique(this.audio ?? [], 'language').map((stream) => {
				m3u8_content.push(`#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",LANGUAGE="${stream.language}",NAME="${this.isoToName(stream.language)}",DEFAULT=${def},AUTOSELECT=YES,URI="audio_${stream.language}/audio_${stream.language}.m3u8"`);
				def = 'NO';
				languages.push(stream.language);
			});

			this.video?.map(() => {
				this.getQualities().forEach((quality) => {
					m3u8_content.push('');
					`${m3u8_content.push(
						`#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=${this.getBitrate(
							quality
						)},CODECS="avc1.4d4015,mp4a.40.2",AUDIO="stereo",RESOLUTION=${quality.width
						}x${quality.height}`
					)},LABEL=${quality.height}P`;
					m3u8_content.push(
						`video_${quality.width}x${quality.height}/video_${quality.width}x${quality.height}.m3u8`
					);
				});
			});
			console.log(m3u8_content.join('\n'));
			// writeFileSync(manifestFile, m3u8_content.join('\n'));
		}
	}

	buildCommand() {

		['-vsync 0', '-init_hw_device opencl=ocl', '-extra_hw_frames 3'];
	}

}

