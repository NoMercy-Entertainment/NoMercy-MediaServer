import { Folder, Jobs, Prisma } from '@prisma/client';
import { Artist, getAcousticFingerprintFromParsedFileList, Medium, Recording, Release } from '../../providers/musicbrainz/fingerprint';
import { cachePath, imagesPath } from '../../state';
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { fileChangedAgo, humanTime, sleep } from '../../functions/dateTime';
import { jsonToString } from '../../functions/stringArray';

import { AudioFFprobe } from '../../encoder/ffprobe/ffprobe';
import FileList from '../../tasks/files/getFolders';
import Logger from '../../functions/logger';
import { ParsedFileList } from '../../tasks/files/filenameParser';
import { getBestArtistImag } from '../../functions/artistImage';
import i18n from '../../loaders/i18n';
import { join } from 'path';
import { confDb } from '../../database/config';
import colorPalette, { colorPaletteFromFile } from '../../functions/colorPalette';
import { PaletteColors } from 'types/server';
import { recording, recordingAppend, RecordingWithAppends } from '../../providers/musicbrainz/recording';
import { releaseCover } from '../../providers/musicbrainz/release';
import { Image } from '../../providers/musicbrainz/cover';
import downloadImage from '../../functions/downloadImage';
import createBlurHash from '../../functions/createBlurHash';
import { findLyrics } from '../../providers';
import lyricsFinder from 'lyrics-finder';

export const storeMusic = async ({ folder, libraryId, task = { id: 'manual' } }: { id: number | string; folder: string; libraryId: string; job?: Jobs, task?: { id: string } }) => {

	// console.log({ folder, libraryId, task });

	await i18n.changeLanguage('en');

	const transaction: Prisma.PromiseReturnType<any>[] = [];

	try {
		await FileList({
			folder: folder,
			recursive: true,
			filter: ['mp3', 'flac'],
			ignoreBaseFilter: true,
		}).then(async (fileList) => {
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
				} else {
					parsedFiles = (await fileList.getParsedFiles()).sort((a, b) => a.path.localeCompare(b.path));

					writeFileSync(folderFile, jsonToString(parsedFiles));
				}
			} catch (error) {
				if (error) {
					Logger.log({
						level: 'error',
						name: 'App',
						color: 'red',
						message: JSON.stringify(error),
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

			for (const file of parsedFiles) {
				const trackInfoFile = join(cachePath, 'temp', file.name.replace(/\.\w{3,}$/u, '.json'));

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
					}).catch(e => console.log(e));
					sleep(1);
				}

				if (!match?.title) {
					console.log(file.path);
					continue;
					// TODO: throw to db for manual review
				}

				for (const artist of match.artists ?? []) {
					await createArtist(libraryId, artist, transaction)
						.catch((e) => {
							// console.log(e);

						});
				}

				await createAlbum(libraryId, file, match.releases[0], match.id, match.title, match.artists, transaction)
					.catch((e) => {
						// console.log(e);

					});

				// await createFile(match, file, libraryId);
			}
		});

		// console.log('before');
		await confDb.$transaction(transaction).catch(e => console.log(e));
		// console.log('after');

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
				message: JSON.stringify(error),
			});
		}

		return {
			success: false,
			message: `Something went wrong adding ${folder}`,
			error: error,
		};
	}
};

const createArtist = async (libraryId: string, artist: Artist, transaction: Prisma.PromiseReturnType<any>[]) => {
	const libraryFolder = (await confDb.folder.findFirst({
		where: {
			Libraries: {
				some: {
					libraryId: libraryId,
				},
			},
		},
	})) as Folder;

	const artistName = artist.name.replace(/[\/]/gu, '_').replace(/“/gu, '');

	const { image, colorPalette, blurHash } = await getArtistImage(libraryFolder.path, artist);

	const artistInsert = Prisma.validator<Prisma.ArtistCreateWithoutAlbumInput>()({
		name: artist.name,
		cover: image,
		blurHash: blurHash,
		colorPalette: colorPalette
			? jsonToString(colorPalette)
			: undefined,
		folder: `/${artistName[0].toUpperCase()}/${artistName}`,
		id: artist.id,
		Library: {
			connect: {
				id: libraryId,
			},
		},
	});

	transaction.push(
		confDb.artist.upsert({
			where: {
				id: artist.id,
			},
			create: artistInsert,
			update: artistInsert,
		})
	);
};

const createAlbum = async (
	libraryId: string,
	file: ParsedFileList,
	album: Release,
	recordingID: string,
	title: string,
	artist: Artist[],
	transaction: Prisma.PromiseReturnType<any>[]
) => {
	for (const artist of album.artists ?? []) {
		await createArtist(libraryId, artist, transaction);
	}

	const { image, colorPalette, blurHash } = await getAlbumImage(album.id, libraryId, file);

	const albumInsert = Prisma.validator<Prisma.AlbumCreateWithoutFileInput>()({
		name: album.title,
		id: album.id,
		cover: image,
		folder: `${file.folder}${file.musicFolder}`.replace(/.+([\\\/]\[Various Artists\][\\\/].+)/u, '$1').replace('/Music', ''),
		colorPalette: colorPalette
			? jsonToString(colorPalette)
			: undefined,
		year: album.date?.year,
		tracks: album.track_count,
		country: album.country,
		blurHash: blurHash,
		Library: {
			connect: {
				id: libraryId,
			},
		},
		Artist: {
			connect: (album.artists?.concat(...artist) ?? [...artist]).map(a => ({
				id: a.id,
			})),
		},
	});

	transaction.push(
		confDb.album.upsert({
			where: {
				id: album.id,
			},
			create: albumInsert,
			update: albumInsert,
		})
	);

	for (const track of album.mediums) {
		await createTrack(track, artist, album, file, recordingID, title, transaction);
	}
};

const createTrack = async (
	track: Medium,
	artist: Artist[],
	album: Release,
	file: ParsedFileList,
	recordingID: string,
	title: string,
	transaction: Prisma.PromiseReturnType<any>[]
) => {
	const { image, colorPalette, blurHash } = await getTrackImage(file, recordingID);
	const duration = humanTime(file.ffprobe?.format.duration);

	let lyrics = await findLyrics({
		duration: duration,
		Album: [album],
		Artist: album.artists?.concat(...artist) ?? [...artist],
		name: title,
	});

	if (!lyrics) {
		lyrics = await lyricsFinder(album.artists?.[0]?.name ?? artist?.[0]?.name, title);
	}

	const trackInsert = Prisma.validator<Prisma.TrackCreateInput>()({
		id: recordingID,
		name: title,
		track: track.position,
		lyrics: lyrics,
		cover: image,
		colorPalette: colorPalette
			? jsonToString(colorPalette)
			: undefined,
		blurHash: blurHash,
		disc: track.tracks[0].position,
		date: album.date?.year
			? new Date(album.date.year, album.date.month ?? 1, album.date.day ?? 1)
			: undefined,
		folder: file.musicFolder
			? `${file.folder}${file.musicFolder}`.replace('/Music', '')
			: file.path.replace(/.+([\\\/].+[\\\/].+)[\\\/]/u, '$1').replace('/Music', ''),
		filename: `/${file.name}`,
		duration: duration,
		path: file.path,
		quality: 320,
		Artist: {
			connect: (album.artists?.concat(...artist) ?? [...artist]).map(a => ({
				id: a.id,
			})),
		},
		Album: {
			connect: {
				id: album.id,
			},
		},
	});

	transaction.push(
		confDb.track.upsert({
			where: {
				id: recordingID,
			},
			create: trackInsert,
			update: trackInsert,
		})
	);

	const recordingInfoFile = join(cachePath, 'temp', `recordingInfo_${recordingID}.json`);

	let response: RecordingWithAppends<typeof recordingAppend[number]> | null;

	if (existsSync(recordingInfoFile)) {
		response = JSON.parse(readFileSync(recordingInfoFile, 'utf8'));
	} else {
		response = await recording(recordingID)
			.then(res => res)
			.catch((e) => {
				console.log(`http://musicbrainz.org/ws/2/recording/${recordingID}?fmt=json&inc='artist-credits+artists+releases+tags+genres`);
				return null;
			});

		if (response?.id) {
			writeFileSync(recordingInfoFile, JSON.stringify(response, null, 2));
		}
	}

	response?.genres.map((genre) => {
		const genreInsert = Prisma.validator<Prisma.MusicGenreCreateInput>()({
			id: genre.id,
			name: genre.name,
			Track: {
				connect: {
					id: recordingID,
				},
			},
		});

		transaction.push(
			confDb.musicGenre.upsert({
				where: {
					id: genre.id,
				},
				create: genreInsert,
				update: genreInsert,
			})
		);
	});
};

const getArtistImage = async (folder: string, artist: Artist): Promise<{ colorPalette: PaletteColors | null; image: string | null; blurHash: string | null }> => {
	let image: string | null = null;
	let palette: PaletteColors | null = null;
	let blurHash: string | null = null;

	const artistName = artist.name.replace(/[\/]/gu, '_').replace(/“/gu, '')
		.replace(/["*?<>|]/gu, '');
	const base = `${folder}/${artistName[0]}/${artistName}/${artistName}`.replace(/[\\\/]undefined/gu, '');

	try {
		if (existsSync(`${base}.jpg`)) {
			image = `/${artistName}.jpg`;
			palette = await colorPaletteFromFile(`${base}.jpg`);
			blurHash = await createBlurHash(readFileSync(`${base}.jpg`));
			copyFileSync(`${base}.jpg`, `${imagesPath}/music/${artist.id}.jpg`);
		} else if (existsSync(`${base}.png`)) {
			image = `/${artistName}.png`;
			palette = await colorPaletteFromFile(`${base}.png`);
			blurHash = await createBlurHash(readFileSync(`${base}.png`));
			copyFileSync(`${base}.png`, `${imagesPath}/music/${artist.id}.png`);
		} else {
			const x = await getBestArtistImag(artistName, base);
			if (x) {
				image = `/${artistName}.${x.extension}`;
				palette = await colorPalette(x.url);
				blurHash = await createBlurHash(x.url);
				await downloadImage(x.url, `${imagesPath}/music/${artist.id}.${x.extension}`)
					.catch(() => {
						//
					});

				if (
					existsSync(`${imagesPath}/music/${artist.id}.${x.extension}`)
					&& statSync(`${imagesPath}/music/${artist.id}.${x.extension}`).size == 0
				) {
					rmSync(`${imagesPath}/music/${artist.id}.${x.extension}`);
				}
			}
		}
	} catch (error) {
		const x = await getBestArtistImag(artistName, base);
		if (x) {
			image = `/${artistName}.${x.extension}`;
			palette = await colorPalette(x.url);
			try {
				await downloadImage(x.url, `${imagesPath}/music/${artist.id}.${x.extension}`)
					.catch(() => {
						//
					});

				if (
					existsSync(`${imagesPath}/music/${artist.id}.${x.extension}`)
					&& statSync(`${imagesPath}/music/${artist.id}.${x.extension}`).size == 0
				) {
					rmSync(`${imagesPath}/music/${artist.id}.${x.extension}`);
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

const getTrackImage = async (file: ParsedFileList, id): Promise<{ colorPalette: PaletteColors | null; image: string | null, blurHash: string | null }> => {
	let image: string | null = null;
	let colorPalette: PaletteColors | null = null;
	let blurHash: string | null = null;
	const base = file.path.replace(/(.+)\.\w{3,}$/u, '$1');

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

const getAlbumImage = async (id: string, libraryId: string, file: ParsedFileList) => {
	let image: string | null = null;
	let palette: PaletteColors | null = null;
	let blurHash: string | null = null;

	const releaseInfoFile = join(cachePath, 'temp', `releaseInfo_${id}.json`);

	let release: Image[] | null;

	if (existsSync(releaseInfoFile)) {
		release = JSON.parse(readFileSync(releaseInfoFile, 'utf8'));
	} else {
		release = await releaseCover(id).catch(e => null);
		writeFileSync(releaseInfoFile, JSON.stringify(release, null, 2));
	}

	const cover = release?.find(i => i.front) ?? release?.[0];
	const coverPath = cover?.thumbnails.small ?? cover?.thumbnails.large;

	if (!coverPath) {
		const libraryFolder = (await confDb.folder.findFirst({
			where: {
				Libraries: {
					some: {
						libraryId: libraryId,
					},
				},
			},
		})) as Folder;

		const path = `${libraryFolder.path}${file.folder}${file.musicFolder}`.replace('Music/Music', 'Music');

		const base = `${path}`
			.replace(/.+([\\\/]\[Various Artists\][\\\/].+)/u, '$1')
			.replace(/[\\\/]undefined/gu, '');
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
				const img = readdirSync(`${path}`).find(a => a.endsWith('.jpg') || a.endsWith('.png'));
				if (img) {
					image = img
						? `/${img}`
						: null;
					palette = await colorPaletteFromFile(`${path}/${img}`);
					blurHash = await createBlurHash(readFileSync(`${path}/${img}`));
					copyFileSync(`${path}/${img}`, `${imagesPath}/music/${id}.png`);
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
			await downloadImage(coverPath, `${imagesPath}/music/${id}.${extension}`).catch(() => {
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

const findRelease = (data: Release[], file: ParsedFileList, parsedFiles: ParsedFileList[]): Release | undefined => {
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

const filterRecordings = (data: Recording[], file: ParsedFileList, parsedFiles: ParsedFileList[]): Recording | undefined => {
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

const createFile = (data: Recording, file: ParsedFileList, libraryId: string, transaction: Prisma.PromiseReturnType<any>[]) => {
	const newFile: Prisma.FileCreateWithoutEpisodeInput = Object.keys(file)
		.filter(key => !['seasons', 'episodeNumbers', 'ep_folder', 'musicFolder'].includes(key))
		.reduce((obj, key) => {
			obj[key] = file[key];
			return obj;
		}, <Prisma.FileCreateWithoutEpisodeInput>{});

	transaction.push(
		confDb.file.upsert({
			where: {
				path_libraryId: {
					libraryId: libraryId,
					path: file.path,
				},
			},
			create: {
				...newFile,
				episodeFolder: file.musicFolder!,
				year: file.year
					? file.year
					: null,
				sources: JSON.stringify(file.sources),
				revision: JSON.stringify(file.revision),
				languages: JSON.stringify(file.languages),
				edition: JSON.stringify(file.edition),
				ffprobe: (file.ffprobe as AudioFFprobe)
					? JSON.stringify(file.ffprobe as AudioFFprobe)
					: null,
				chapters: JSON.stringify([]),
				seasonNumber: Number((file.ffprobe as AudioFFprobe).tags?.disc?.split('/')[0]),
				episodeNumber: Number((file.ffprobe as AudioFFprobe).tags?.track?.split('/')[0]),
				Library: {
					connect: {
						id: libraryId,
					},
				},
				Album: {
					connect: {
						id: data.id,
					},
				},
			},
			update: {
				...newFile,
				episodeFolder: file.musicFolder!,
				year: file.year
					? file.year
					: null,
				sources: JSON.stringify(file.sources),
				revision: JSON.stringify(file.revision),
				languages: JSON.stringify(file.languages),
				edition: JSON.stringify(file.edition),
				ffprobe: (file.ffprobe as AudioFFprobe)
					? JSON.stringify(file.ffprobe as AudioFFprobe)
					: null,
				chapters: JSON.stringify([]),
				seasonNumber: Number((file.ffprobe as AudioFFprobe).tags?.disc?.split('/')[0]),
				episodeNumber: Number((file.ffprobe as AudioFFprobe).tags?.track?.split('/')[0]),
				Library: {
					connect: {
						id: libraryId,
					},
				},
				Album: {
					connect: {
						id: data.id,
					},
				},
			},
		})
	);
};
