import { CurrentFolder } from ".";
import Logger from "@server/functions/logger";
import { insertArtistLibrary } from "@server/db/media/actions/artist_library";
import { insertArtistMusicGenre } from "@server/db/media/actions/artist_musicGenre";
import { insertArtist, findArtist } from "@server/db/media/actions/artists";
import { insertMusicGenre } from "@server/db/media/actions/musicGenres";
import { getBestArtistImag } from "@server/functions/artistImage";
import colorPalette, { colorPaletteFromFile } from "@server/functions/colorPalette";
import createBlurHash from "@server/functions/createBlurHash";
import { sleep } from "@server/functions/dateTime";
import downloadImage from "@server/functions/downloadImage";
import { fanart_artist } from "@server/providers/fanart/music";
import { ArtistWithAppends, artistAppend, artist } from "@server/providers/musicbrainz/artist";
import { apiCachePath, imagesPath } from "@server/state";
import { PaletteColors } from "@server/types/server";
import { existsSync, readFileSync, writeFileSync, copyFileSync, statSync, rmSync } from "fs";
import { join, resolve } from "path";
import {
	Artist
} from '../../../providers/musicbrainz/fingerprint';
import { EncodingLibrary } from "@server/db/media/actions/libraries";

export const createArtist = async (library: EncodingLibrary, artist: Artist, currentFolder: CurrentFolder) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding artist: ${artist.name}`,
	});
	
	const artistName = artist.name
		.replace(/[\/]/gu, '_')
		.replace(/“/gu, '')
		.replace(/-/gu, '')
		.replace(/^\.+/u, '')
		.replace(/["*?<>|]/gu, '');

	const artistFolder = isNaN(parseInt(artistName[0], 10))
		? artistName[0].toUpperCase()
		: '#';

	const { image, colorPalette, blurHash } = await getArtistImage(currentFolder.folder.path as string, artist);

	insertArtist({
		id: artist.id,
		name: artist.name,
		cover: image,
		blurHash: blurHash,
		colorPalette: colorPalette
			? JSON.stringify(colorPalette)
			: undefined,
		folder: `/${artistFolder.toUpperCase()}/${artistName}`,
		library_id: library.id as string,
	});

	insertArtistLibrary({
		artist_id: artist.id,
		library_id: library.id as string,
	});

	const response = await getArtistInfo(artist.id);

	for (const genre of response?.genres ?? []) {
		insertMusicGenre({
			id: genre.id,
			name: genre.name,
		});
		try {
			insertArtistMusicGenre({
				artist_id: artist.id,
				musicGenre_id: genre.id,
			});
		} catch (error) {
			console.log(error);
		}
	};

	process.send!({
		type: 'custom',
		event: 'update_content',
		data: ['music', 'artist', artist.id, '_'],
	});

};

export const getArtistInfo = async (artistID: string) => {

	const artistInfoFile = join(apiCachePath, `artistInfo_${artistID}.json`);

	let response: ArtistWithAppends<typeof artistAppend[number]> | null;

	if (existsSync(artistInfoFile)) {
		response = JSON.parse(readFileSync(artistInfoFile, 'utf8'));
	} else {
		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Fetching artist: ${artistID}`,
		});

		response = await artist(artistID)
			.then(res => res)
			.catch(({ response }) => {
				// console.log(`http://musicbrainz.org/ws/2/recording/${recordingID}?fmt=json&inc=artist-credits+artists+releases+tags+genres`);
				// console.log(response?.data);
				return null;
			});

		if (response?.id) {
			writeFileSync(artistInfoFile, JSON.stringify(response, null, 2));
		}
		sleep(500);
	}

	return response;
};

export const getArtistImage = async (folder: string, _artist: Artist) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding artist image: ${_artist.name}`,
	});
	let image: string | null = null;
	let palette: PaletteColors | null = null;
	let blurHash: string | null = null;
	
	const artistName = _artist.name
		.replace(/[\/]/gu, '_')
		.replace(/“/gu, '')
		.replace(/^\.+/u, '')
		.replace(/["*?<>|]/gu, '');

	const artistFolder = isNaN(parseInt(artistName[0], 10))
		? artistName[0].toUpperCase()
		: '#';

	const base = resolve(`${folder}/${artistFolder}/${artistName}/${artistName}`.replace(/[\\\/]undefined/gu, ''));

	const hasImage = existsSync(`${imagesPath}/music/${_artist.id}.jpg`);

	try {

		const artistResult = findArtist(_artist.id);
		if (artistResult && artistResult.cover && artistResult.colorPalette) {
			return {
				image: artistResult.cover,
				colorPalette: JSON.parse(artistResult.colorPalette),
				// blurHash: JSON.parse(artistResult.blurHash),
			};
		}

		if (!hasImage) {

			const images = await fanart_artist(_artist.id);

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
		}
	} catch (error) {
		// console.log(error);
	}

	try {
		if (hasImage) {
			image = `/${_artist.id}.jpg`;
			palette = await colorPaletteFromFile(`${imagesPath}/music/${_artist.id}.jpg`);
			blurHash = await createBlurHash(readFileSync(`${imagesPath}/music/${_artist.id}.jpg`));
		} else if (existsSync(`${base}.jpg`)) {
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