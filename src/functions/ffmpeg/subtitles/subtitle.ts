import { AppState, useSelector } from '@/state/redux';
import { exec, execSync } from 'child_process';
import { ffmpeg, subtitleEdit } from '@/state';

import type { VideoFFprobe } from '../../../encoder/ffprobe/ffprobe';
import fs from 'fs';
import makeAttachmentsFile from './attatchments';

export default (ffprobe: VideoFFprobe, outputFolder: string, fileName: string) => {
	const subtitleMap: any[] = [];
	const subtitle: any[] = [];
	// let subEdit = false;

	const keepOriginal = useSelector((state: AppState) => state.config.keepOriginal);

	const dir = `${outputFolder}subtitles/`;
	fs.mkdirSync(dir, { recursive: true });

	const fontsFolder = `${outputFolder}fonts/`;
	fs.mkdirSync(fontsFolder, { recursive: true });

	convertSubToVtt(dir);

	// rename(dir, fileName, () => {
	//     if (ffprobe.format.filename.includes('Ripper')) {
	//         if(fs.existsSync(ffprobe.format.filename)){
	//             fs.rmSync(ffprobe.format.filename);
	//         }
	//         let folder = ffprobe.format.filename.replace(/[\\\/][\w\s_-]*\.\w{3,}$/u, '')
	//         if (fs.readdirSync(folder).length == 0) {
	//             fs.rmSync(folder, { recursive: true });
	//         }
	//     }
	// });

	makeAttachmentsFile(ffprobe.streams.attachments, outputFolder);

	const attatchmentsCommand = `"${ffmpeg}" -dump_attachment:t "" -i "${ffprobe.format.filename}" -y  -hide_banner -max_muxing_queue_size 9999 -async 1 -loglevel panic 2>&1`;
	exec(attatchmentsCommand, { cwd: fontsFolder, maxBuffer: 1024 * 5000 }, (error) => {
		if (error) {
			const attachmentsFile = `${outputFolder}/fonts.json`;
			if (!fs.existsSync(attachmentsFile)) {
				return;
			}

			JSON.parse(fs.readFileSync(attachmentsFile, 'utf8')).forEach((font) => {
				if (fs.existsSync(fontsFolder + font.file)) {
					fs.renameSync(fontsFolder + font.file, fontsFolder + font.file.toLowerCase());
				}
			});
		}
	});

	ffprobe.streams.subtitle.map((stream, index) => {
		const ext = getExtension(stream.codec_name);
		const type = getSubType(stream.title, index);

		if (!stream.language) {
			stream.language = 'eng';
		}

		const subFileBase = `subtitles/${fileName}.${stream.language}.${type}.${ext}`;
		const subFile = `${dir + fileName}.${stream.language}.${type}.${ext}`;

		if (
			ext == 'sup'
			&& keepOriginal.subtitles
			&& !fs.existsSync(subFile.replace('/subtitles', '/original'))
		) {
			subtitleMap.push(`-map 0:${stream.index}`);
			subtitleMap.push('-c:s copy');
			subtitleMap.push(`"${subFileBase}"`);
			subtitle.push({
				type: ext,
				lang: stream.language,
				stream: stream.index,
			});
		} else if (!fs.existsSync(subFile) && ext.match(/ass|vtt/u)) {
			subtitleMap.push(`-map 0:${stream.index}`);

			if (ext.match(/ass|sub/u)) {
				subtitleMap.push('-c:s copy');
			}
			subtitleMap.push(`"${subFileBase}"`);
			subtitle.push({
				type: ext,
				lang: stream.language,
				stream: stream.index,
			});
		} else if (!fs.existsSync(subFile) && !ext.match(/ass|vtt/u)) {
			subtitle.push({
				type: 'Subtitle Edit',
				lang: stream.language,
				stream: stream.index,
			});
			// subEdit = true;
		}
	});

	// if (subEdit) {
	//     exec(`${subtitleEdit} /convert "${ffprobe.format.filename}" WebVtt /outputfolder:"${dir}" /ocrengine:tesseract`, () => {
	//         rename(dir, fileName, () => {
	//             if (ffprobe.format.filename.includes('Ripper')) {
	//             }
	//         });
	//     });
	// }
	// else {
	//     rename(dir, fileName, () => {
	//         if (ffprobe.format.filename.includes('Ripper')) {
	//         }
	//     });
	// }

	const log = subtitle
		.filter(l => l.audio !== null)
		.map(l => ` s:${l.stream}:${l.lang}.${l.type} `)
		.join(' ');

	return {
		subtitleMap,
		log,
	};
};

export const getSubtitleFiles = function (ffprobe: VideoFFprobe, outputFolder: string, fileName: string) {
	const subtitles: any[] = [];

	const dir = `${outputFolder}subtitles/`;

	ffprobe.streams.subtitle.forEach((stream, index) => {
		const ext = getExtension(stream.codec_name);
		const type = getSubType(stream.title, index);
		const subFile = `${dir + fileName}.${stream.language}.${type}.${ext}`;

		if (ext.match(/ass|vtt|sup/u)) {
			subtitles.push(subFile);
		}
	});

	return subtitles;
};

export const rename = (dir: string, fileName: string, callback = () => null) => {
	const files = fs.readdirSync(dir).filter(f => !f.match(/full|sign|sdh|forced/iu));
	let arr: any[] = [];
	files.forEach((f) => {
		const reg = /(?<lang>\w{3})\.\w{3}$/u.exec(f);
		if (reg?.groups) {
			arr[reg.groups.lang] = [];
		}
	});
	// console.log(arr);

	files.forEach((f) => {
		const reg = /(?<lang>\w{3})\.\w{3}$/u.exec(f);
		if (reg?.groups) {
			arr[reg.groups.lang].push(f);
		}
	});

	arr = arr.sort((a, b) => {
		return fs.statSync(dir + b).size - fs.statSync(dir + a).size;
	});

	Object.values(arr).forEach((a) => {
		a.forEach((f, index) => {
			const reg = /(?<lang>\w{3})\.\w{3}$/u.exec(f);
			if (reg?.groups) {
				if (index == 0) {
					fs.renameSync(dir + f, `${dir + fileName}.${reg.groups.lang}.full.vtt`);
				}
				if (index == 1) {
					fs.renameSync(dir + f, `${dir + fileName}.${reg.groups.lang}.sign.vtt`);
				}
				if (index == 2) {
					fs.renameSync(dir + f, `${dir + fileName}.${reg.groups.lang}.sdh.vtt`);
				}
				if (index == 3) {
					fs.renameSync(dir + f, `${dir + fileName}.${reg.groups.lang}.forced.vtt`);
				}
			}
		});
	});
	callback();
};

export const getExtension = function (codec_name: string) {
	let extension;
	switch (codec_name) {
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
};

export const getSubType = function (title: string, index = 0) {
	if (!title && index == 0) {
		return 'full';
	}
	if (!title) {
		return 'full';
	}
	if (title.match(/sign|S&S/iu)) {
		return 'sign';
	}
	if (title.match(/forced/iu)) {
		return 'forced';
	}
	if (title.match(/sdh/iu)) {
		return 'sdh';
	}
	if (title.match(/full|Dialog/iu)) {
		return 'full';
	}
	return 'full';
};

export const convertSubToVtt = async function (folder: string) {

	const assToVtt = useSelector((state: AppState) => state.config.assToVtt);
	const keepOriginal = useSelector((state: AppState) => state.config.keepOriginal);

	if (fs.existsSync(folder)) {
		// TODO: convert sup first and then convert ass if sup doesnt exist.
		const files = fs.readdirSync(folder);
		for (let i = 0; i < files.length; i++) {
			const s = files[i];
			if (
				(!s.match(/.ass$|.vtt$/u) && !fs.existsSync(folder + s.replace(/\.\w{3}$/u, '.vtt')))
				|| (assToVtt
					&& !s.endsWith('.vtt')
					&& !fs.existsSync(folder + s.replace(/\.\w{3}$/u, '.vtt')))
			) {
				try {
					await execSync(`${subtitleEdit} /convert "${`${folder}/${s}`}" WebVtt`);
					if (keepOriginal.subtitles && fs.existsSync(folder + s) && !s.match(/.ass$|.vtt$/u)) {
						try {
							fs.renameSync(folder + s, `${folder}../original/${s}`);
						} catch (error) {
							//
						}
					} else if (fs.existsSync(folder + s) && !s.match(/.ass$|.vtt$/u)) {
						try {
							fs.rmSync(folder + s);
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

export const getExistingSubtitles = function (ffprobe: VideoFFprobe) {
	const path = ffprobe.format.filename.replace(/(.+)[\\\/].+/u, '$1/subtitles');

	const arr: any[] = [];

	if (!fs.existsSync(path)) {
		ffprobe.streams.subtitle.forEach((s) => {
			arr.push({
				language: s.language,
				type: getSubType(s.title, s.index),
				ext: getExtension(s.codec_name),
			});
		});

		return arr;
	}

	const files = fs.readdirSync(path);
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
};
