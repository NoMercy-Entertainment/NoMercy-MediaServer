import { fileChangedAgo, humanTime } from 'functions/dateTime';

import Logger from 'functions/logger';
import { confDb } from 'database/config';
/* eslint-disable no-useless-escape */
import { execSync } from 'child_process';
import fs from 'fs';
import getAudioInfo from 'encoder/ffprobe/getAudioInfo';
import { getBestArtistImag } from 'functions/artistImage';
import getFolders from 'tasks/files/getFolders';
import { javaHash } from 'functions/stringArray';
import path from 'path';

const parse = (str) => {
	if (!(/^(\d){8}$/u).test(str)) {
		return null;
	}
	const y = str.substr(0, 4);
	const m = str.substr(4, 2) - 1;
	const d = str.substr(6, 2);
	return new Date(y, m, d);
};

export default async function () {
	const folder = `${process.env.SHARE_ROOT}/Music/`;
	let music: any[] = [];

	const folderFile = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'cache',
		`${folder.replace(/[\/\\]/gu, '_').replace(':', '_')}.json`
	);

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: 'Searching music files',
	});

	if (fs.existsSync(folderFile) && fileChangedAgo(folderFile, 'minutes') < 50) {
		music = JSON.parse(fs.readFileSync(folderFile, 'utf-8'));
	} else if (fs.existsSync(folder)) {
		const folders = await getFolders({folder, recursive: true, filter: ['mp3', 'flac']});
		music = folders.getFiles();
		console.log(music);

		process.exit();

		fs.writeFileSync(folderFile, JSON.stringify(music));
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Found ${music.length} music files, this may take ${music.length > 1000 ? 'a while' : 'a few minutes'
		}`,
	});

	const cache: {
		id: string
		image: string
	}[] = [];

	const result: any[] = [];

	for (let i = 0; i < music.length; i++) {
		const fileIn: any = music[i];

		let ffprobe: any = await getAudioInfo(fileIn).catch(reason =>
			console.log(reason));
		if (ffprobe) {
			const regex
				// eslint-disable-next-line max-len
				= /(?<host_folder>.*)[\\\/](?<root>Music)[\\\/]((?<firstLetter>\w{1})[\\\/])?(?<artist>[\w\d\s\.'"’(),_\[\]@#$!&+-]+)[\\\/]([\w\d\s\.'"’(),_\[\]@#$!&+-]+\))?(?<albumFolder>(\[(?<year>\d{4})\] )?(?<album>[\w\d\s\.'"’(),_\[\]@#$!&+-\[\]]+))[\\\/](?<fileName>((((?<disc>\d{1,2})[\s-])?(?<track>\d{1,2}))|\[\d{4}\])[\s\.]*(?<title>[\w\d\s\.'"’(),_\[\]@#$!&+-]+).(?<ext>m4a|flac|mp3))/u;

			const match: any = regex.exec(ffprobe.format.filename);

			if (match?.groups && ffprobe.tags) {
				const albumName = ffprobe.tags.album || match.groups.album;
				const albumId = ffprobe.tags.MusicBrainz_album_id || javaHash(albumName);
				const artsitName = ffprobe.tags.album_artist || ffprobe.tags.artist;
				const originalyear = ffprobe.tags.originalyear;

				const disc = ffprobe.tags.disc;
				const track = ffprobe.tags.track;
				const title = ffprobe.tags.title || match.groups.title;

				const artistIds = ffprobe.tags.MusicBrainz_artist_ids?.map((a) => {
					return {
						artistId: a,
					};
				}) || [javaHash(artsitName)];

				const genres: any = ffprobe.tags.genre?.map((a) => {
					return {
						name: a.split('/')?.[0]?.trim() || a,
					};
				});

				const artists = ffprobe.tags.ARTISTS || [ffprobe.tags.artist];

				const file = match.groups.fileName;
				const folder = `${match.groups.root}/${match.groups.firstLetter ? `${match.groups.firstLetter}/` : ''
				}${match.groups.artist}`;
				const rootFolder = `${match.groups.host_folder}/${folder}`;

				let albumImage: any;
				if (
					fs.existsSync(`${rootFolder}/${match.groups.albumFolder}/Cover.jpg`)
				) {
					albumImage = `${folder}/${match.groups.albumFolder}/Cover.jpg`;
				} else {
					const img = fs
						.readdirSync(
							`${match.groups.host_folder}/${folder}/${match.groups.albumFolder}`
						)
						.find(a => a.endsWith('.jpg'));

					albumImage = img ? `${folder}/${match.groups.albumFolder}/${img}` : null;
				}

				let trackImage: any = null;
				if (fs.existsSync(fileIn.replace(/\.\w{3,4}$/u, '.jpg'))) {
					trackImage = `${file.replace(/\.\w{3,4}$/u, '.jpg')}`;
				}

				if (ffprobe.format.duration == 'N/A') {
					const oldFile = fileIn.replace('.mp3', '.old.mp3');

					fs.renameSync(fileIn, oldFile);

					execSync(`ffmpeg -i "${oldFile}" -c:a mp3 "${fileIn}" -y`);

					ffprobe = await getAudioInfo(fileIn).catch(reason =>
						console.log(reason));

					if (ffprobe.format.duration != 'N/A') {
						fs.rmSync(oldFile);
					}
				}

				if (genres && artists) {
					genres.map(async (genre) => {
						await confDb.musicGenre.upsert({
							where: {
								name: genre.name,
							},
							create: {
								name: genre.name,
							},
							update: {
								name: genre.name,
							},
						});
					});
				}

				if (artistIds && artists) {
					artistIds.map(async (artist, index) => {
						let artistImage: any;
						if (
							fs.existsSync(
								`${match.groups.host_folder}/${folder}/${artists[index]}.jpg`
							)
						) {
							artistImage = `${folder}/${artists[index]}.jpg`;
						}
						if (
							fs.existsSync(
								`${match.groups.host_folder}/${folder}/${artists[index]}.webp`
							)
						) {
							artistImage = `${folder}/${artists[index]}.webp`;
						}

						if (!artistImage && !cache.some(i => i.id == artistIds[0])) {
							const i = await confDb.artist.findFirst({
								where: { artistId: artist.artistId ?? artistIds[0] },
							});

							if (i?.cover) {
								cache.push({
									id: artistIds[0],
									image: i.cover,
								});
							} else {
								try {
									const x = await getBestArtistImag(
										artists[index],
										`${folder}/${artists[index][0]}/${artists[index]}/${artists[index]}.jpg`
									);
									if (x) {
										artistImage = `/Music/${artists[index][0]}/${artists[index]}/${artists[index]}.jpg`;
										cache.push({
											id: artistIds[0],
											image: `/Music/${artists[index][0]}/${artists[index]}/${artists[index]}.jpg`,
										});
									}
								} catch (error) {
									//
								}
							}
						} else if (
							!artistImage
							&& cache.some(i => i.id == artistIds[0])
						) {
							albumImage = cache.find(i => i.id == artistIds[0])?.image;
						}

						await confDb.artist.upsert({
							where: {
								artistId: artist.artistId ?? artistIds[0],
							},
							create: {
								name: artists[index],
								cover: artistImage ?? undefined,
								folder: `/Music/${artists[index][0]}/${artists[index]}`,
								artistId: artist.artistId ?? artistIds[0],
							},
							update: {
								name: artists[index],
								cover: artistImage,
								folder: `/Music/${artists[index][0]}/${artists[index]}`,
								artistId: artist.artistId ?? artistIds[0],
							},
						});
					});
				}

				const albumData: any = {
					name: albumName,
					albumId: albumId,
					cover: albumImage,
					year: originalyear,
					description: artsitName,
					artist: {
						connect: {
							artistId: artistIds[0]?.artistId,
						},
					},
				};

				if (!artistIds[0]?.artistId) {
					delete albumData.artist;
				}

				await confDb.album.upsert({
					where: {
						name: albumName,
					},
					create: albumData,
					update: albumData,
				});

				if ((new Date(ffprobe.tags.date) as any) == 'Invalid Date') {
					ffprobe.tags.date = parse(ffprobe.tags.date);
				}

				const quality: any = isNaN(ffprobe.audio.bit_rate) ? null : Math.floor(ffprobe.audio.bit_rate / 1000);

				const data: any = {
					name: title,
					track: track,
					cover: trackImage,
					disc: disc,
					date: new Date(ffprobe.tags.date),
					folder: `${folder}/${match.groups.albumFolder}`,
					filename: file,
					duration: humanTime(ffprobe.format.duration).replace(/^00:/u, ''),
					host_folder: rootFolder,
					quality: isNaN(quality) ? null : quality,
					music_genre: {
						connect: genres,
					},
					album: {
						connectOrCreate: {
							where: {
								name: albumName,
							},
							create: albumData,
						},
					},
					artist: {
						connect: artistIds,
					},
				};

				if (!ffprobe.tags.genre) {
					delete data.music_genre;
				}
				if (!albumId) {
					delete data.album;
				}
				if (!artistIds) {
					delete data.artist;
				}

				if (data.name) {
					let createdtrack;
					try {
						createdtrack = await confDb.track.upsert({
							where: {
								track_unique: {
									filename: data.filename,
									host_folder: data.host_folder,
								},
							},
							create: data,
							update: data,
						});
					} catch (error) {
						//
					}

					result.push(createdtrack);
				}
			}
		}
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Music library updated, found ${result.length} tracks`,
	});

	return result;
}
