import { insertAlbumArtist } from '@server/db/media/actions/album_artist';
import { insertAlbumLibrary } from '@server/db/media/actions/album_library';
import { insertAlbumMusicGenre } from '@server/db/media/actions/album_musicGenre';
import { findAlbum, insertAlbum } from '@server/db/media/actions/albums';
import { insertMusicGenre } from '@server/db/media/actions/musicGenres';
import Logger from '@server/functions/logger';
import { ParsedFileList } from '@server/tasks/files/filenameParser';
import { CurrentFolder } from '.';
import { createArtist } from './createArtist';
import { createTrack } from './createTrack';
import { PaletteColors } from '@server/types/server';
import { join } from 'path';
import colorPalette, { colorPaletteFromFile } from '@server/functions/colorPalette';
import { sleep } from '@server/functions/dateTime';
import downloadImage from '@server/functions/downloadImage';
import { fanart_album } from '@server/providers/fanart/music';
import { release, releaseAppend, releaseCover, ReleaseWithAppends } from '@server/providers/musicbrainz/release';
import { apiCachePath, imagesPath } from '@server/state';
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { Image } from '@server/providers/musicbrainz/cover';
import { Artist, Release } from '@server/providers/musicbrainz/fingerprint';
import { EncodingLibrary } from '@server/db/media/actions/libraries';

export const createAlbum = async (
	library: EncodingLibrary,
	file: ParsedFileList,
	album: Release,
	recordingID: string,
	title: string,
	artist: Artist[],
	currentFolder: CurrentFolder
) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding album: ${title}`,
	});

	const {
		image,
		colorPalette,
		blurHash,
	} = await getAlbumImage(album.id, library, file, currentFolder);

	insertAlbum({
		id: album.id,
		name: album.title,
		cover: image,
		folder: `${file.folder}${file.musicFolder}`
			.replace(/.+([\\\/]\[Various Artists\][\\\/].+)/u, '$1'),
		colorPalette: colorPalette
			?			JSON.stringify(colorPalette ?? '{}')
			:			undefined,
		year: album.date?.year,
		tracks: album.track_count,
		country: album.country,
		blurHash: blurHash,
		library_id: library.id as string,
	});

	insertAlbumLibrary({
		album_id: album.id,
		library_id: library.id as string,
	});

	for (const artist of album.artists ?? []) {
		await createArtist(library, artist, currentFolder);
		try {
			insertAlbumArtist({
				album_id: album.id,
				artist_id: artist.id,
			});
		} catch (error) {
			console.log(error);
		}
	}

	const response = await getAlbumInfo(album.id);

	for (const genre of response?.genres ?? []) {
		insertMusicGenre({
			id: genre.id,
			name: genre.name,
		});
		try {
			insertAlbumMusicGenre({
				album_id: album.id,
				musicGenre_id: genre.id,
			});
		} catch (error) {
			console.log(error);
		}
	}

	for (const track of album.mediums ?? []) {
		await createTrack(track, artist, album, file, recordingID, title, currentFolder);
	}

	process.send!({
		type: 'custom',
		event: 'update_content',
		data: ['music', 'album', album.id, '_'],
	});

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Album: ${album.title} added successfully`,
	});

	return album;
};

export const getAlbumInfo = async (releaseID: string) => {

	const albumInfoFile = join(apiCachePath, `albumInfo_${releaseID}.json`);

	let response: ReleaseWithAppends<typeof releaseAppend[number]> | null;

	if (existsSync(albumInfoFile)) {
		response = JSON.parse(readFileSync(albumInfoFile, 'utf8'));
	} else {
		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Fetching release: ${releaseID}`,
		});

		response = await release(releaseID)
			.then(res => res)
			.catch(() => {
				// console.log(`http://musicbrainz.org/ws/2/release/${releaseID}?fmt=json&inc=artist-credits+artists+releases+tags+genres`);
				// console.log(response?.data);
				return null;
			});

		if (response?.id) {
			writeFileSync(albumInfoFile, JSON.stringify(response, null, 2));
		}
		sleep(500);
	}

	return response;
};

export const getAlbumImage = async (id: string, library: EncodingLibrary, file: ParsedFileList, currentFolder: CurrentFolder) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding album image: ${file.path}`,
	});
	let image: string | null = null;
	let palette: PaletteColors | null = null;
	const blurHash: string | null = null;

	const albumImageFile = join(apiCachePath, `albumImage_${id}.json`);

	let release: Image[] | null;

	if (existsSync(albumImageFile)) {
		release = JSON.parse(readFileSync(albumImageFile, 'utf8'));
	} else {
		release = await releaseCover(id)
			.catch(() => null);
		if (release?.length) {
			writeFileSync(albumImageFile, JSON.stringify(release, null, 2));
		}
	}

	const cover = release?.find(i => i.front) ?? release?.[0];
	const coverPath = cover?.thumbnails.small ?? cover?.thumbnails.large;

	if (!coverPath) {
		const p = `${currentFolder.folder.path}${file.folder}${file.musicFolder}`;

		const base = `${p}`
			.replace(/.+([\\\/]\[Various Artists\][\\\/].+)/u, '$1')
			.replace(/[\\\/]undefined/gu, '');

		const hasImage = existsSync(`${imagesPath}/music/${id}.png`);

		try {

			const albumResult = findAlbum(id);
			if (albumResult) {
				return {
					image: albumResult.cover,
					colorPalette: JSON.parse(albumResult.colorPalette ?? '{}'),
					// blurHash: albumResult.blurHash,
				};
			}

			if (!hasImage) {
				console.log('Fetching fanart');
				const images = await fanart_album(id);

				if (images?.albums?.[id].albumcover?.[0]?.url !== undefined) {
					image = images?.albums?.[id].albumcover?.[0]?.url as string;
					palette = image
						?						await colorPalette(image)
						:						null;
					// blurHash = image
					// 	? await createBlurHash(image)
					// 	: null;
					image && await downloadImage({
						url: image,
						path: `${imagesPath}/music/${id}.jpg`,
					})
						.catch((e) => {
							console.log(e);
						});

					return {
						image,
						colorPalette: palette,
						blurHash,
					};
				}
			}
		} catch (error: any) {
			console.log(error?.response?.data?.['error message']);
		}

		try {
			console.log('finding local image');
			if (hasImage) {
				image = '/cover.jpg';
				palette = await colorPaletteFromFile(`${imagesPath}/music/${id}.png`);
				// blurHash = await createBlurHash(readFileSync(`${imagesPath}/music/${id}.png`));
			} else if (existsSync(`${base}/cover.jpg`)) {
				image = '/cover.jpg';
				palette = await colorPaletteFromFile(`${base}/cover.jpg`);
				// blurHash = await createBlurHash(readFileSync(`${base}/cover.jpg`));
				copyFileSync(`${base}/cover.jpg`, `${imagesPath}/music/${id}.jpg`);
			} else if (existsSync(`${base}/cover.png`)) {
				image = '/cover.png';
				palette = await colorPaletteFromFile(`${base}/cover.png`);
				// blurHash = await createBlurHash(readFileSync(`${base}/cover.png`));
				copyFileSync(`${base}/cover.png`, `${imagesPath}/music/${id}.png`);
			} else {
				const img = readdirSync(`${p}`)
					.find(a => a.endsWith('.jpg') || a.endsWith('.png'));
				if (img) {
					image = img
						?						`/${img}`
						:						null;
					palette = await colorPaletteFromFile(`${p}/${img}`);
					// blurHash = await createBlurHash(readFileSync(`${p}/${img}`));
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
		console.log('Fetching cover');
		palette = coverPath
			?			await colorPalette(coverPath)
			:			null;

		const extension = coverPath?.replace(/.+(\w{3,})$/u, '$1')
			.replace('unknown', 'png');

		if (!existsSync(`${imagesPath}/music/${id}.${extension}`)) {
			await downloadImage({
				url: coverPath,
				path: `${imagesPath}/music/${id}.${extension}`,
			})
				.catch(() => {
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
