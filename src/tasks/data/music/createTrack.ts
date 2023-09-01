
import { insertAlbumTrack } from '@server/db/media/actions/album_track';
import { insertArtistTrack } from '@server/db/media/actions/artist_track';
import { insertMusicGenreTrack } from '@server/db/media/actions/musicGenre_track';
import { insertMusicGenre } from '@server/db/media/actions/musicGenres';
import { insertTrack } from '@server/db/media/actions/tracks';
import { AudioFFprobe } from '@server/encoder/ffprobe/ffprobe';
import { colorPaletteFromFile } from '@server/functions/colorPalette';
import { humanTime, sleep } from '@server/functions/dateTime';
import Logger from '@server/functions/logger';
import {
	Artist, Medium, Release
} from '../../../providers/musicbrainz/fingerprint';
import { apiCachePath, imagesPath } from '@server/state';
import { ParsedFileList } from '@server/tasks/files/filenameParser';
import { PaletteColors } from '@server/types/server';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync, statSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { RecordingWithAppends, recordingAppend, recording } from '@server/providers/musicbrainz/recording';
import { CurrentFolder } from '.';

export const createTrack = async (
	track: Medium,
	artists: Artist[],
	album: Release,
	file: ParsedFileList,
	recordingID: string,
	title: string,
	currentFolder: CurrentFolder
) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding track: ${title}`,
	});

	const { image, colorPalette, blurHash } = await getTrackImage(file, recordingID);
	const duration = humanTime(file.ffprobe?.format.duration);

	if ((file.ffprobe as AudioFFprobe)?.audio?.codec_name == 'alac') {
		const newFile = file.path.replace(/(.+)\.\w{3,}$/u, '$1.flac');

		try {
			execSync(`ffmpeg -i "${file.path}" -c:a flac -compression_level 12 "${newFile}" -n 2>&1`);
		} catch (error: any) {
			console.log(error.toString('utf8'));
		}

		file.name = file.name.replace(/(.+)\.\w{3,}$/u, '$1.flac');
	}

	// Logger.log({
	// 	level: 'info',
	// 	name: 'App',
	// 	color: 'magentaBright',
	// 	message: `Searching lyrics: ${title}`,
	// });
	// let lyrics = await findLyrics({
	// 	duration: duration,
	// 	Album: [album],
	// 	Artist: album.artists?.concat(...artists) ?? [...artists],
	// 	name: title,
	// });

	// if (!lyrics) {
	// 	lyrics = await lyricsFinder(album.artists?.[0]?.name ?? artists?.[0]?.name, title);
	// }

	insertTrack({
		id: recordingID,
		name: title,
		disc: track.position,
		track: track?.tracks[0].position,
		// lyrics: lyrics,
		cover: image,
		colorPalette: colorPalette
			? JSON.stringify(colorPalette)
			: undefined,
		blurHash: blurHash,
		date: album.date?.year
			? new Date(album.date.year, album.date.month ?? 1, album.date.day ?? 1)
				.toISOString()
				.slice(0, 19)
				.replace('T', ' ')
			: undefined,
		folder: file.musicFolder
			? `${file.folder}${file.musicFolder}`.replace('/Music', '')
			: file.path.replace(/.+([\\\/].+[\\\/].+)[\\\/]/u, '$1').replace('/Music', ''),
		filename: `/${file.name}`,
		duration: duration,
		path: file.path,
		quality: 320,
		folder_id: currentFolder.folder.id!,
	});

	insertAlbumTrack({
		album_id: album.id,
		track_id: recordingID,
	});

	for (const artist of artists ?? []) {
		try {
			insertArtistTrack({
				artist_id: artist.id,
				track_id: recordingID,
			});
		} catch (error) {
			console.log(error);
		}
	}

	const response = await getTrackInfo(recordingID);

	for (const genre of response?.genres ?? []) {
		insertMusicGenre({
			id: genre.id,
			name: genre.name,
		});

		insertMusicGenreTrack({
			musicGenre_id: genre.id,
			track_id: recordingID,
		});

	};

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Track: ${title} added successfully`,
	});
};


export const getTrackInfo = async (recordingID: string) => {

	const trackInfoFile = join(apiCachePath, `trackInfo_${recordingID}.json`);

	let response: RecordingWithAppends<typeof recordingAppend[number]> | null;

	if (existsSync(trackInfoFile)) {
		response = JSON.parse(readFileSync(trackInfoFile, 'utf8'));
	} else {
		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Fetching recording: ${recordingID}`,
		});

		response = await recording(recordingID)
			.then(res => res)
			.catch(({ response }) => {
				// console.log(`http://musicbrainz.org/ws/2/recording/${recordingID}?fmt=json&inc=artist-credits+artists+releases+tags+genres`);
				// console.log(response?.data);
				return null;
			});

		if (response?.id) {
			writeFileSync(trackInfoFile, JSON.stringify(response, null, 2));
		}
		sleep(500);
	}

	return response;
};

export const getTrackImage = async (file: ParsedFileList, id: string) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding track image: ${file.path}`,
	});

	let image: string | null = null;
	let colorPalette: PaletteColors | null = null;
	let blurHash: string | null = null;
	const base = resolve(file.path.replace(/(.+)\.\w{3,}$/u, '$1'));
	const hasImage = existsSync(`${imagesPath}/music/${id}.jpg`);

	try {
		if (hasImage) {
			image = `${file.path.replace(/.+([\\\/].+)\.\w{3,}$/u, '$1.jpg')}`;
			colorPalette = await colorPaletteFromFile(`${imagesPath}/music/${id}.jpg`);
			// blurHash = await createBlurHash(readFileSync(`${imagesPath}/music/${id}.jpg`));
		} else if (existsSync(`${base}.jpg`)) {
			image = `${file.path.replace(/.+([\\\/].+)\.\w{3,}$/u, '$1.jpg')}`;
			colorPalette = await colorPaletteFromFile(`${base}.jpg`);
			// blurHash = await createBlurHash(readFileSync(`${base}.jpg`));
			copyFileSync(`${base}.jpg`, `${imagesPath}/music/${id}.jpg`);
		} else if (existsSync(`${base}.png`)) {
			image = `${file.path.replace(/.+([\\\/].+)\.\w{3,}$/u, '$1.png')}`;
			colorPalette = await colorPaletteFromFile(`${base}.png`);
			// blurHash = await createBlurHash(readFileSync(`${base}.jpg`));
			copyFileSync(`${base}.png`, `${imagesPath}/music/${id}.png`);
		}

		if (existsSync(`${imagesPath}/music/${id}.jpg`) && statSync(`${imagesPath}/music/${id}.jpg`).size == 0) {
			rmSync(`${imagesPath}/music/${id}.jpg`);
		} else if (existsSync(`${imagesPath}/music/${id}.png`) && statSync(`${imagesPath}/music/${id}.png`).size == 0) {
			rmSync(`${imagesPath}/music/${id}.png`);
		}
	} catch (error) {
		console.log(error);
	}

	return {
		image,
		colorPalette,
		blurHash,
	};
};
