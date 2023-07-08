import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
// import lyricsFinder from 'lyrics-finder';
import { join, resolve } from 'path';
import { PaletteColors } from 'types/server';

import { Folder } from '@/database/config/client';
import type { AudioFFprobe } from '@/encoder/ffprobe/ffprobe';
import { getBestArtistImag } from '@/functions/artistImage';
import colorPalette, { colorPaletteFromFile } from '@/functions/colorPalette';
import { fileChangedAgo, humanTime, sleep } from '@/functions/dateTime';
import downloadImage from '@/functions/downloadImage';
import Logger from '@/functions/logger';
import i18n from '@/loaders/i18n';
// import { findLyrics } from '../../providers';
import { Image } from '@/providers/musicbrainz/cover';
import {
	Artist, getAcousticFingerprintFromParsedFileList, Medium, Recording, Release
} from '../../providers/musicbrainz/fingerprint';
import {
	recording, recordingAppend, RecordingWithAppends
} from '../../providers/musicbrainz/recording';
import { releaseCover } from '../../providers/musicbrainz/release';
import { cachePath, imagesPath } from '@/state';
import { ParsedFileList } from '../../tasks/files/filenameParser';
import FileList from '../../tasks/files/getFolders';
import { mediaDb } from '@/db/media';
import { eq } from 'drizzle-orm';
import { libraries } from '../../db/media/schema/libraries';
import { findArtist, insertArtist } from '@/db/media/actions/artists';
import { findAlbum, insertAlbum } from '@/db/media/actions/albums';
import { insertTrack } from '@/db/media/actions/tracks';
import { insertMusicGenre } from '@/db/media/actions/musicGenres';
import { insertMusicGenreTrack } from '@/db/media/actions/musicGenre_track';
import { insertAlbumArtist } from '../../db/media/actions/album_artist';
import { insertAlbumTrack } from '@/db/media/actions/album_track';
import { Library } from '@/db/media/actions/libraries';
import { insertArtistTrack } from '@/db/media/actions/artist_track';
import { insertArtistLibrary } from '@/db/media/actions/artist_library';
import { insertAlbumLibrary } from '@/db/media/actions/album_library';
import createBlurHash from '@/functions/createBlurHash/createBlurHash';
import { album, artist } from '@/providers/fanart/music';
import { execSync } from 'child_process';

type Lib = Library & {
	folder_library: {
		folder: Folder;
	}[];
	folder: Folder;
};

export const storeMusic = async ({
	folder,
	libraryId,
	task = { id: 'manual' },
}: {
	folder: string;
	libraryId: string;
	task?: { id: string; };
}) => {

	console.log({ folder, libraryId, task });

	await i18n.changeLanguage('en');

	try {
		await FileList({
			folder: folder,
			recursive: true,
			filter: ['mp3', 'flac', 'm4a'],
			ignoreBaseFilter: true,
		}).then(async (fileList) => {
			// console.log(fileList);
			const folderFile = join(cachePath, 'temp', `${folder.replace(/[\\\/:]/gu, '_')}_parsed.json`);

			let parsedFiles: ParsedFileList[] = new Array<ParsedFileList>();
			try {
				if (
					existsSync(folderFile)
					&& fileChangedAgo(folderFile, 'days') < 50
					&& JSON.parse(readFileSync(folderFile, 'utf-8')).length > 0
				) {
					parsedFiles = JSON.parse(readFileSync(folderFile, 'utf-8')).sort((a: ParsedFileList, b: ParsedFileList) =>
						a.path.localeCompare(b.path));
				}
				parsedFiles = (await fileList.getParsedFiles()).sort((a, b) => a.path.localeCompare(b.path));

				writeFileSync(folderFile, JSON.stringify(parsedFiles));

			} catch (error) {
				if (error) {
					Logger.log({
						level: 'error',
						name: 'App',
						color: 'red',
						message: JSON.stringify([`${__filename}`, error]),
					});
				}

				return {
					success: false,
					message: `Something went wrong adding ${folder}`,
					error: error,
				};
			}

			if (!parsedFiles) {
				return;
			}

			const currentLib: Lib = mediaDb.query.libraries.findFirst({
				where: eq(libraries.id, libraryId),
				with: {
					folder_library: {
						with: {
							folder: true,
						},
					},
				},
			}) as unknown as Lib;

			for (const file of parsedFiles) {
				const trackInfoFile = join(cachePath, 'temp', file.name.replace(/\.\w{3,}$/u, '.json'));

				const libraryFolder = currentLib.folder_library.find(f => file.path.startsWith(f.folder.path));

				const library = {
					...currentLib,
					folder: libraryFolder?.folder ?? currentLib.folder_library[0].folder,
				};

				let match: Recording = <Recording>{};

				if (existsSync(trackInfoFile)) {
					// console.log(`file ${trackInfoFile}`);
					match = JSON.parse(readFileSync(trackInfoFile, 'utf8'));
				} else {
					// console.log(`api ${trackInfoFile}`);
					await new Promise((resolve, reject) => {
						try {
							getAcousticFingerprintFromParsedFileList(file)
								.then((data) => {
									if (!data?.recordings) {
										return reject(new Error('no recordings'));
									}

									const newMatch = filterRecordings(data?.recordings, file, parsedFiles);
									if (newMatch) {
										match = newMatch;
									} else {
										match = data?.recordings[0];
									}

									if (match?.id) {
										writeFileSync(trackInfoFile, JSON.stringify(match, null, 2));
										resolve(true);
									} else {
										reject(new Error(`Nothing found for: ${file.name}`));
									}

								})
								.catch(error => reject(error));
						} catch (error) {
							reject(error);
						}
					}).catch(console.log);
					sleep(1);
				}

				if (!match?.title) {
					console.log(file.path);
					continue;
					// TODO: throw to db for manual review
				}

				for (const artist of match.artists ?? []) {
					await createArtist(library, artist)
						.catch(console.log);
				}

				await createAlbum(
					library,
					file,
					match.releases[0],
					match.id,
					match.title,
					match.artists
				)
					.catch(console.log);

				// await createFile(match, file, libraryId);
			}
		});

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Folder: ${folder} added successfully`,
		});

		return {
			success: true,
			message: `Folder: ${folder} added successfully`,
			data: {
				folder,
				id: 10,
			},
		};
	} catch (error: any) {
		if (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify([`${__filename}`, error]),
			});
		}

		return {
			success: false,
			message: `Something went wrong adding ${folder}`,
			error: error,
		};
	}
};

const createArtist = async (library: Lib, artist: Artist) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding artist: ${artist.name}`,
	});
	const artistName = artist.name.replace(/[\/]/gu, '_')
		.replace(/“/gu, '')
		.replace(/‐/gu, '-');

	const { image, colorPalette, blurHash } = await getArtistImage(library.folder.path, artist);

	insertArtist({
		id: artist.id,
		name: artist.name,
		cover: image,
		blurHash: blurHash,
		colorPalette: colorPalette
			? JSON.stringify(colorPalette)
			: undefined,
		folder: `/${artistName[0].toUpperCase()}/${artistName}`,
		library_id: library.id as string,
	});

	insertArtistLibrary({
		artist_id: artist.id,
		library_id: library.id as string,
	});

	process.send!({
		type: 'custom',
		event: 'update_content',
		data: ['music', 'artist', artist.id, '_'],
	});

};

const createAlbum = async (
	library: Lib,
	file: ParsedFileList,
	album: Release,
	recordingID: string,
	title: string,
	artist: Artist[]
) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding album: ${title}`,
	});

	const { image, colorPalette, blurHash } = await getAlbumImage(album.id, library, file);

	insertAlbum({
		id: album.id,
		name: album.title,
		cover: image,
		folder: `${file.folder}${file.musicFolder}`
			.replace(/.+([\\\/]\[Various Artists\][\\\/].+)/u, '$1')
			.replace('/Music', ''),
		colorPalette: colorPalette
			? JSON.stringify(colorPalette)
			: undefined,
		year: album.date?.year,
		tracks: album.track_count,
		country: album.country,
		blurHash: blurHash,
		library_id: library.id as string,
	});

	for (const artist of album.artists ?? []) {
		await createArtist(library, artist);
		insertAlbumArtist({
			album_id: album.id,
			artist_id: artist.id,
		});
	}

	// if ((!album.artists || album.artists?.length == 0)
	// 	&& (file.ffprobe as AudioFFprobe)?.tags.MusicBrainz_album_artist_id
	// 	&& (file.ffprobe as AudioFFprobe)?.tags.MusicBrainz_album_id) {
	// 	insertAlbumArtist({
	// 		album_id: (file.ffprobe as AudioFFprobe)?.tags.MusicBrainz_album_id as string,
	// 		artist_id: (file.ffprobe as AudioFFprobe)?.tags.MusicBrainz_album_artist_id as string,
	// 	});
	// }

	insertAlbumLibrary({
		album_id: album.id,
		library_id: library.id as string,
	});

	for (const track of album.mediums) {
		await createTrack(track, artist, album, file, recordingID, title, library);
	}

	process.send!({
		type: 'custom',
		event: 'update_content',
		data: ['music', 'album', album.id, '_'],
	});

};

const createTrack = async (
	track: Medium,
	artists: Artist[],
	album: Release,
	file: ParsedFileList,
	recordingID: string,
	title: string,
	library: Lib
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
		track: track.tracks[0].position,
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
		folder_id: library.folder.id,
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

	const recordingInfoFile = join(cachePath, 'temp', `recordingInfo_${recordingID}.json`);

	let response: RecordingWithAppends<typeof recordingAppend[number]> | null;

	if (existsSync(recordingInfoFile)) {
		response = JSON.parse(readFileSync(recordingInfoFile, 'utf8'));
	} else {
		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Fetching track: ${title} info`,
		});

		response = await recording(recordingID)
			.then(res => res)
			.catch(({ response }) => {
				// console.log(`http://musicbrainz.org/ws/2/recording/${recordingID}?fmt=json&inc=artist-credits+artists+releases+tags+genres`);
				// console.log(response?.data);
				return null;
			});

		if (response?.id) {
			writeFileSync(recordingInfoFile, JSON.stringify(response, null, 2));
		}
		sleep(2000);
	}

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

const getArtistImage = async (folder: string, _artist: Artist) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding artist image: ${_artist.name}`,
	});
	let image: string | null = null;
	let palette: PaletteColors | null = null;
	let blurHash: string | null = null;

	const artistName = _artist.name.replace(/[\/]/gu, '_').replace(/“/gu, '')
		.replace(/["*?<>|]/gu, '');
	const base = resolve(`${folder}/${artistName[0]}/${artistName}/${artistName}`.replace(/[\\\/]undefined/gu, ''));

	try {

		const artistResult = findArtist(_artist.id);
		if (artistResult && artistResult.cover && artistResult.colorPalette && artistResult.blurHash) {
			return {
				image: artistResult.cover,
				colorPalette: JSON.parse(artistResult.colorPalette),
				blurHash: JSON.parse(artistResult.blurHash),
			};
		}

		const images = await artist(_artist.id);

		if (images?.artistthumb?.[0]?.url) {
			image = images?.artistthumb?.[0]?.url;
			await downloadImage({ url: image, path: `${imagesPath}/music/${_artist.id}.jpg` })
				.catch((e) => {
					console.log(e);
				});
			palette = await colorPaletteFromFile(`${imagesPath}/music/${_artist.id}.jpg`);
			blurHash = await createBlurHash(readFileSync(`${imagesPath}/music/${_artist.id}.jpg`));
			return {
				image,
				colorPalette: palette,
				blurHash,
			};
		}
	} catch (error) {
		// console.log(error);
	}

	try {
		if (existsSync(`${base}.jpg`)) {
			image = `/${artistName}.jpg`;
			palette = await colorPaletteFromFile(`${base}.jpg`);
			blurHash = await createBlurHash(readFileSync(`${base}.jpg`));
			copyFileSync(`${base}.jpg`, `${imagesPath}/music/${_artist.id}.jpg`);
		} else if (existsSync(`${base}.png`)) {
			image = `/${artistName}.png`;
			palette = await colorPaletteFromFile(`${base}.png`);
			blurHash = await createBlurHash(readFileSync(`${base}.png`));
			copyFileSync(`${base}.png`, `${imagesPath}/music/${_artist.id}.png`);
		} else {
			const x = await getBestArtistImag(artistName, base);
			if (x) {
				Logger.log({
					level: 'info',
					name: 'App',
					color: 'magentaBright',
					message: `Fetching artist image: ${artistName}`,
				});
				image = `/${artistName}.${x.extension}`;
				palette = await colorPalette(x.url);
				blurHash = await createBlurHash(x.url);
				await downloadImage({ url: x.url, path: `${imagesPath}/music/${_artist.id}.${x.extension}` })
					.catch(() => {
						//
					});

				if (
					existsSync(`${imagesPath}/music/${_artist.id}.${x.extension}`)
					&& statSync(`${imagesPath}/music/${_artist.id}.${x.extension}`).size == 0
				) {
					rmSync(`${imagesPath}/music/${_artist.id}.${x.extension}`);
				}
			}
		}
	} catch (error) {
		const x = await getBestArtistImag(artistName, base);
		if (x) {
			image = `/${artistName}.${x.extension}`;
			palette = await colorPalette(x.url);
			try {
				Logger.log({
					level: 'info',
					name: 'App',
					color: 'magentaBright',
					message: `Fetching artist image: ${artistName}`,
				});
				await downloadImage({ url: x.url, path: `${imagesPath}/music/${_artist.id}.${x.extension}` })
					.catch(() => {
						//
					});

				if (
					existsSync(`${imagesPath}/music/${_artist.id}.${x.extension}`)
					&& statSync(`${imagesPath}/music/${_artist.id}.${x.extension}`).size == 0
				) {
					rmSync(`${imagesPath}/music/${_artist.id}.${x.extension}`);
				}
			} catch (error) {
				console.log(error);
			}
		}
	}

	return {
		image,
		colorPalette: palette,
		blurHash,
	};
};

const getTrackImage = async (file: ParsedFileList, id) => {
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

	try {
		if (existsSync(`${base}.jpg`)) {
			image = `${file.path.replace(/.+([\\\/].+)\.\w{3,}$/u, '$1.jpg')}`;
			colorPalette = await colorPaletteFromFile(`${base}.jpg`);
			blurHash = await createBlurHash(readFileSync(`${base}.jpg`));
			copyFileSync(`${base}.jpg`, `${imagesPath}/music/${id}.jpg`);
		} else if (existsSync(`${base}.png`)) {
			image = `${file.path.replace(/.+([\\\/].+)\.\w{3,}$/u, '$1.png')}`;
			colorPalette = await colorPaletteFromFile(`${base}.png`);
			blurHash = await createBlurHash(readFileSync(`${base}.jpg`));
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

const getAlbumImage = async (id: string, library: Lib, file: ParsedFileList) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding album image: ${file.path}`,
	});
	let image: string | null = null;
	let palette: PaletteColors | null = null;
	let blurHash: string | null = null;

	const releaseInfoFile = join(cachePath, 'temp', `releaseInfo_${id}.json`);

	let release: Image[] | null;

	if (existsSync(releaseInfoFile)) {
		release = JSON.parse(readFileSync(releaseInfoFile, 'utf8'));
	} else {
		release = await releaseCover(id).catch(() => null);
		writeFileSync(releaseInfoFile, JSON.stringify(release, null, 2));
	}

	const cover = release?.find(i => i.front) ?? release?.[0];
	const coverPath = cover?.thumbnails.small ?? cover?.thumbnails.large;
	const libraryFolder = library.folder_library.find(f => file.folder.startsWith(f.folder.path)) ?? library.folder_library[0];

	if (!coverPath) {
		const p = resolve(`${libraryFolder.folder.path}${file.folder}${file.musicFolder}`);

		const base = `${p}`
			.replace(/.+([\\\/]\[Various Artists\][\\\/].+)/u, '$1')
			.replace(/[\\\/]undefined/gu, '');

		try {

			const albumResult = findAlbum(id);
			if (albumResult) {
				return {
					image: albumResult.cover,
					colorPalette: albumResult.colorPalette,
					blurHash: albumResult.blurHash,
				};
			}

			const images = await album(id);

			if (images?.albums?.[id].albumcover?.[0]?.url !== undefined) {
				image = images?.albums?.[id].albumcover?.[0]?.url as string;
				palette = image
					? await colorPalette(image)
					: null;
				blurHash = image
					? await createBlurHash(image)
					: null;
				image && await downloadImage({ url: image, path: `${imagesPath}/music/${id}.jpg` })
					.catch((e) => {
						console.log(e);
					});

				return {
					image,
					colorPalette: palette,
					blurHash,
				};
			}
		} catch (error) {
			// console.log(error);
		}

		try {
			if (existsSync(`${base}/cover.jpg`)) {
				image = '/cover.jpg';
				palette = await colorPaletteFromFile(`${base}/cover.jpg`);
				blurHash = await createBlurHash(readFileSync(`${base}/cover.jpg`));
				copyFileSync(`${base}/cover.jpg`, `${imagesPath}/music/${id}.png`);
			} else if (existsSync(`${base}/cover.png`)) {
				image = '/cover.png';
				palette = await colorPaletteFromFile(`${base}/cover.png`);
				blurHash = await createBlurHash(readFileSync(`${base}/cover.png`));
				copyFileSync(`${base}/cover.png`, `${imagesPath}/music/${id}.png`);
			} else {
				const img = readdirSync(`${p}`).find(a => a.endsWith('.jpg') || a.endsWith('.png'));
				if (img) {
					image = img
						? `/${img}`
						: null;
					palette = await colorPaletteFromFile(`${p}/${img}`);
					blurHash = await createBlurHash(readFileSync(`${p}/${img}`));
					copyFileSync(`${p}/${img}`, `${imagesPath}/music/${id}.png`);
				}
			}

			if (existsSync(`${imagesPath}/music/${id}.png`) && statSync(`${imagesPath}/music/${id}.png`).size == 0) {
				rmSync(`${imagesPath}/music/${id}.png`);
			} else if (existsSync(`${imagesPath}/music/${id}.jpg`) && statSync(`${imagesPath}/music/${id}.jpg`).size == 0) {
				rmSync(`${imagesPath}/music/${id}.jpg`);
			}
		} catch (error) {
			console.log(error);
		}

		return {
			image: image,
			colorPalette: palette,
			blurHash,
		};
	}

	try {
		palette = coverPath
			? await colorPalette(coverPath)
			: null;

		const extension = coverPath?.replace(/.+(\w{3,})$/u, '$1').replace('unknown', 'png');

		if (!existsSync(`${imagesPath}/music/${id}.${extension}`)) {
			await downloadImage({ url: coverPath, path: `${imagesPath}/music/${id}.${extension}` }).catch(() => {
				//
			});
			if (existsSync(`${imagesPath}/music/${id}.${extension}`) && statSync(`${imagesPath}/music/${id}.${extension}`).size == 0) {
				rmSync(`${imagesPath}/music/${id}.${extension}`);
			}
		}
	} catch (error) {
		//
	}

	return {
		image: coverPath,
		colorPalette: palette,
	};
};

const findRelease = (data: Release[], file: ParsedFileList, parsedFiles: ParsedFileList[]) => {
	const matches = /.+[\\\/]((?<album>\d{1,2})-)?(?<track>\d{1,2})(\.)?\s(?<title>.+)\.(?<ext>\w{3,4})$/u.exec(file.path)?.groups;
	const albumName = file.musicFolder?.replace(/[\\\/]\[\d{4}\]\s|\[\w+\]/u, '');
	// Number((file.ffprobe as AudioFFprobe)?.format?.duration.toFixed(0))

	let releases = data?.filter(r => r.title == albumName);
	if (!releases) {
		releases = data;
	}

	if (releases.length > 1) {
		releases = releases?.filter(r => r.mediums?.[0]?.position == Number(matches?.album));
	}

	if (releases.length > 1) {
		releases = releases?.filter(r => r.mediums?.[0]?.tracks?.[0]?.position == Number(matches?.track));
	}

	if (releases.length > 1) {
		releases = releases?.filter(r => r.track_count == parsedFiles.filter(p => p.musicFolder == file.musicFolder).length);
	}

	if (releases.length == 1) {
		return releases[0];
	}

	if (releases.length == 0) {
		releases = data.filter(
			r =>
				r.id == (file.ffprobe as AudioFFprobe).tags?.MusicBrainz_album_id || r.title == (file.ffprobe as AudioFFprobe).tags?.album
		);
		if (releases.length == 1) {
			return releases[0];
		}
	}

	// throw to db for manual review
};

const filterRecordings = (data: Recording[], file: ParsedFileList, parsedFiles: ParsedFileList[]) => {
	let recording: Recording | undefined;

	for (const _recording of data) {
		if (!_recording?.releases) continue;

		const release = findRelease(_recording.releases, file, parsedFiles);

		if (release) {
			_recording.releases = [release];
			recording = _recording;
			break;
		}
	}
	return recording;
};

// const createFile = async (
// 	data: Recording,
// 	file: ParsedFileList,
// 	library: Lib
// ) => {
// 	const newFile: Prisma.FileCreateWithoutEpisodeInput = Object.keys(file)
// 		.filter(key => !['seasons', 'episodeNumbers', 'ep_folder', 'musicFolder'].includes(key))
// 		.reduce((obj, key) => {
// 			obj[key] = file[key];
// 			return obj;
// 		}, <Prisma.FileCreateWithoutEpisodeInput>{});

// 	await confDb.file.upsert({
// 		where: {
// 			path_libraryId: {
// 				libraryId: library.id,
// 				path: file.path,
// 			},
// 		},
// 		create: {
// 			...newFile,
// 			episodeFolder: file.musicFolder!,
// 			year: file.year
// 				? file.year
// 				: null,
// 			sources: JSON.stringify(file.sources),
// 			revision: JSON.stringify(file.revision),
// 			languages: JSON.stringify(file.languages),
// 			edition: JSON.stringify(file.edition),
// 			ffprobe: (file.ffprobe as AudioFFprobe)
// 				? JSON.stringify(file.ffprobe as AudioFFprobe)
// 				: null,
// 			chapters: JSON.stringify([]),
// 			seasonNumber: Number((file.ffprobe as AudioFFprobe).tags?.disc?.split('/')[0]),
// 			episodeNumber: Number((file.ffprobe as AudioFFprobe).tags?.track?.split('/')[0]),
// 			Library: {
// 				connect: {
// 					id: library.id,
// 				},
// 			},
// 			Album: {
// 				connect: {
// 					id: data.id,
// 				},
// 			},
// 		},
// 		update: {
// 			...newFile,
// 			episodeFolder: file.musicFolder!,
// 			year: file.year
// 				? file.year
// 				: null,
// 			sources: JSON.stringify(file.sources),
// 			revision: JSON.stringify(file.revision),
// 			languages: JSON.stringify(file.languages),
// 			edition: JSON.stringify(file.edition),
// 			ffprobe: (file.ffprobe as AudioFFprobe)
// 				? JSON.stringify(file.ffprobe as AudioFFprobe)
// 				: null,
// 			chapters: JSON.stringify([]),
// 			seasonNumber: Number((file.ffprobe as AudioFFprobe).tags?.disc?.split('/')[0]),
// 			episodeNumber: Number((file.ffprobe as AudioFFprobe).tags?.track?.split('/')[0]),
// 			Library: {
// 				connect: {
// 					id: library.id,
// 				},
// 			},
// 			Album: {
// 				connect: {
// 					id: data.id,
// 				},
// 			},
// 		},
// 	});
// };
