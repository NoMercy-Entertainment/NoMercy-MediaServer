import { AudioFFprobe } from '@server/encoder/ffprobe/ffprobe';
import { ParsedFileList } from '@server/tasks/files/filenameParser';
import { getArtistImage, getArtistInfo } from './createArtist';
import Logger from '@server/functions/logger/logger';
import { insertArtist } from '@server/db/media/actions/artists';
import { insertArtistLibrary } from '@server/db/media/actions/artist_library';
import { getAlbumImage, getAlbumInfo } from './createAlbum';
import { EncodingLibrary } from '@server/db/media/actions/libraries';
import { CurrentFolder } from '.';
import { insertAlbum } from '@server/db/media/actions/albums';
import { humanTime, parseYear } from '@server/functions/dateTime';
import { getTrackImage, getTrackInfo } from './createTrack';
import { execSync } from 'child_process';
import { insertTrack } from '@server/db/media/actions/tracks';
import { insertAlbumTrack } from '@server/db/media/actions/album_track';
import { insertArtistTrack } from '@server/db/media/actions/artist_track';
import { insertMusicGenre } from '@server/db/media/actions/musicGenres';
import { insertMusicGenreTrack } from '@server/db/media/actions/musicGenre_track';
import { ArtistWithAppends } from '@server/providers/musicbrainz/artist';
import { ReleaseWithAppends } from '@server/providers/musicbrainz/release';
import { Track } from '@server/providers/musicbrainz/recording';
import { insertAlbumLibrary } from '@server/db/media/actions/album_library';
import { insertAlbumArtist } from '@server/db/media/actions/album_artist';

export default async (file: ParsedFileList, library: EncodingLibrary, currentFolder: CurrentFolder) => {
	try {

		console.log(file.path);

		const album_artist_id = (file.ffprobe as AudioFFprobe)?.tags.MusicBrainz_album_artist_id;
		const album_id = (file.ffprobe as AudioFFprobe)?.tags.MusicBrainz_album_id;
		console.log(album_artist_id, album_id);

		if (!album_artist_id || !album_id) {
			throw new Error(`Not enough info for: ${file.name}`);
		}

		const artist = await createArtist(file, library, album_artist_id, currentFolder);

		if (!artist) {
			return;
		}

		await createAlbum(file, library, album_id, artist, currentFolder);


	} catch (error) {

	}
};

const createArtist = async (
	file: ParsedFileList,
	library: EncodingLibrary,
	album_artist_id: string,
	currentFolder: CurrentFolder
) => {

	const artist = await getArtistInfo(album_artist_id);
	if (!artist) {
		return;
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding artist: ${artist.name}`,
	});
	const artistName = artist.name.replace(/[\/]/gu, '_')
		.replace(/“/gu, '')
		.replace(/‐/gu, '-');

	const { image, colorPalette, blurHash } = await getArtistImage(currentFolder.folder.path as string, artist);

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

	return artist;

};

const createAlbum = async (
	file: ParsedFileList,
	library: EncodingLibrary,
	album_id: string,
	artist: ArtistWithAppends<'recordings' | 'genres' | 'releases' | 'release-groups' | 'works'>,
	currentFolder: CurrentFolder
) => {

	const album = await getAlbumInfo(album_id);

	if (!album) {
		return;
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding album: ${album.title} by ${artist.name}`,
	});

	const { image, colorPalette, blurHash } = await getAlbumImage(album.id, library, file, currentFolder);

	insertAlbum({
		id: album.id,
		name: album.title,
		cover: image,
		folder: `${file.folder}${file.musicFolder}`
			.replace(/.+([\\\/]\[Various Artists\][\\\/].+)/u, '$1')
			.replace('/Music', ''),
		colorPalette: colorPalette
			? JSON.stringify(colorPalette ?? '{}')
			: undefined,
		year: parseYear(album.date.toISOString()),
		tracks: album.media[0].tracks.length,
		country: album.country,
		blurHash: blurHash,
		library_id: library.id as string,
	});

	insertAlbumLibrary({
		album_id: album.id,
		library_id: library.id as string,
	});

	insertAlbumArtist({
		album_id: album.id,
		artist_id: artist.id,
	});

	console.log(album.media);
	for (const track of album.media[0].tracks) {
		await createTrack(track, artist, album, file, currentFolder);
	}

};

export const createTrack = async (
	track: Track,
	artist: ArtistWithAppends<'genres' | 'recordings' | 'releases' | 'release-groups' | 'works'>,
	album: ReleaseWithAppends<'collections' | 'genres' | 'relations' | 'aliases' | 'annotation' | 'artist-credit' | 'label-info' | 'media' | 'release-group' | 'tags'>,
	file: ParsedFileList,
	currentFolder: CurrentFolder
) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding track: ${track.title}`,
	});

	const Track = await getTrackInfo(track.id);

	const { image, colorPalette, blurHash } = await getTrackImage(file, track.id);
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

	insertTrack({
		id: (Track || track).id,
		name: (Track || track).title,
		disc: Track?.releases[0].media[0].position || track.position,
		track: Track?.releases[0].media[0].position || track.position,
		cover: image,
		colorPalette: colorPalette
			? JSON.stringify(colorPalette)
			: undefined,
		blurHash: blurHash,
		date: album?.date?.toISOString()
			.slice(0, 19)
			.replace('T', ' '),
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
		track_id: (Track || track).id,
	});

	insertArtistTrack({
		artist_id: artist.id,
		track_id: track.id,
	});

	for (const genre of Track?.genres ?? []) {
		insertMusicGenre({
			id: genre.id,
			name: genre.name,
		});

		insertMusicGenreTrack({
			musicGenre_id: genre.id,
			track_id: (Track || track).id,
		});

	};

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Track: ${(Track || track).title} added successfully`,
	});
};
