// import { AppState, useSelector } from '../../state/redux';

import { readdirSync, writeFileSync } from 'fs';

import { FFmpegWrapper } from '../ffmpeg/fingerprint/Fingerprinter';

// import { Store } from '../ffmpeg/store';
// import ripper from '../ripper';

// import { confDb } from '../../database/config';
// import { Media, Prisma } from '../../database/config/client';
// import { downloadAndHash } from '../../tasks/data/image';

// import ChromecastAPI from 'chromecast-api';
// import Device from 'chromecast-api/lib/device';
// import { OnDemand } from '../ffmpeg/onDemand';

export default async () => {

	const folder = 'D:/TV.Shows/Download/NCIS.(2003)';
	// const file = 'D:/TV.Shows/Download/NCIS.(2003)/NCIS.S19E01.Blood.in.the.Water.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv';
	// const file2 = 'D:/TV.Shows/Download/NCIS.(2003)/NCIS.S19E02.Nearly.Departed.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv';

	// const episodes = [
	// 	{
	// 		EpisodeId: '1',
	// 		title: 'NCIS',
	// 		path: file,
	// 	},
	// 	{
	// 		EpisodeId: '2',
	// 		title: 'NCIS',
	// 		path: file2,
	// 	},
	// ];

	const episodes = readdirSync(folder).map((f, index) => {
		return {
			EpisodeId: index.toString(),
			title: 'NCIS',
			path: `${folder}/${f}`,
		};
	});

	const fp = new FFmpegWrapper();

	for (const episode of episodes.slice(0, 1)) {
		await fp.open(episode);
		await fp.detectSilence();
		// const args = fp.silenceRanges.filter(s => s.duration > 1).map(s => ({ start: s.start, end: s.end }))[0];
		writeFileSync('detect.json', JSON.stringify(fp, null, 2));
		console.log(fp);
	}

	// execSync('C:/Users/Stoney/AppData/Local/NoMercy/root/binaries/ffmpeg.exe -hide_banner -i "D:/TV.Shows/Download/NCIS.(2003)/NCIS.S19E01.Blood.in.the.Water.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv" -filter_complex "select=\'gt(scene,0.3)\',metadata=print:file=-" -f null - > output.txt 2>&1');

	// ripper();

	// const onDemand = new Store();

	// await onDemand.fromFile('C:/Media/Marvels/Films/Download/Iron.Man.2.2010.2160p.US.BluRay.REMUX.HEVC.DTS-HD.MA.TrueHD.7.1.Atmos-FGT/Iron.Man.2.2010.2160p.US.BluRay.REMUX.HEVC.DTS-HD.MA.TrueHD.7.1.Atmos-FGT.mkv');

	// onDemand
	// 	// .enableDebug()
	// 	.verifyHLS()
	// 	.makeStack()
	// 	.check()
	// 	.start(() => onDemand.buildSprite());

	// const transaction = new Array<Prisma.Prisma__MediaClient<Media, never>>();

	// confDb.media.findMany({
	// 	where: {
	// 		OR: [
	// 			{
	// 				blurHash: null,
	// 			},
	// 			{
	// 				colorPalette: null,
	// 			},
	// 		],
	// 		src: {
	// 			startsWith: '/',
	// 		},
	// 	},
	// })
	// 	.then(async (images) => {

	// 		console.log(`Found ${images.length} images to make blurHashes for`);

	// 		for (const image of images) {
	// 			// console.log(`Making blurHash: ${image.src}`);
	// 			await downloadAndHash({
	// 				src: image.src,
	// 				table: 'media',
	// 				column: 'src',
	// 				type: image.type!,
	// 			});
	// 		};
	// 	})
	// 	.finally(() => {
	// 		console.log('Done making all blurHashes');
	// 	});

	// confDb.movie.findMany()
	// 	.then(async (movies) => {
	// 		for (const movie of movies) {
	// 			console.log(`Deleting Movie: ${movie.title} (${movie.id})`);
	// 			await confDb.movie.delete({
	// 				where: {
	// 					id: movie.id,
	// 				},
	// 			});
	// 		}
	// 	})
	// 	.finally(() => {
	// 		console.log('Done deleting all movies');
	// 	});

	// confDb.person.findMany()
	// 	.then(async (persons) => {
	// 		for (const person of persons) {
	// 			console.log(`Deleting person: ${person.name} (${person.id})`);
	// 			await confDb.person.delete({
	// 				where: {
	// 					id: person.id,
	// 				},
	// 			});
	// 		}
	// 	})
	// 	.finally(() => {
	// 		console.log('Done deleting all people');
	// 	});
	// confDb.image.findMany()
	// 	.then(async (images) => {
	// 		for (const image of images) {
	// 			console.log(`Deleting image: ${image.name} (${image.id})`);
	// 			await confDb.image.delete({
	// 				where: {
	// 					id: image.id,
	// 				},
	// 			});
	// 		}
	// 	})
	// 	.finally(() => {
	// 		console.log('Done deleting all images');
	// 	});
	// confDb.translation.findMany()
	// 	.then(async (translations) => {
	// 		for (const translation of translations) {
	// 			console.log(`Deleting translation: ${translation.title} (${translation.id})`);
	// 			await confDb.translation.delete({
	// 				where: {
	// 					id: translation.id,
	// 				},
	// 			});
	// 		}
	// 	})
	// 	.finally(() => {
	// 		console.log('Done deleting all translations');
	// 	});

	// const transaction: any[] = [];

	// const movies = await confDb.movie.findMany({
	// 	select: {
	// 		id: true,
	// 	},
	// }).then(movie => movie.map(m => m.id));

	// const tvs = await confDb.tv.findMany({
	// 	select: {
	// 		id: true,
	// 	},
	// }).then(tv => tv.map(m => m.id));

	// const similars = await confDb.similar.findMany();
	// for (const similar of similars ?? []) {
	// 	if (similar.mediaType == 'movie') {
	// 		transaction.push(confDb.similar.update({
	// 			where: {
	// 				id: similar.id,
	// 			},
	// 			data: {
	// 				MovieFrom: {
	// 					connect: {
	// 						id: similar.similarableId,
	// 					},
	// 				},
	// 			},
	// 		}));
	// 		if (movies.includes(similar.mediaId)) {
	// 			transaction.push(confDb.similar.update({
	// 				where: {
	// 					id: similar.id,
	// 				},
	// 				data: {
	// 					MovieTo: {
	// 						connect: {
	// 							id: similar.mediaId,
	// 						},
	// 					},
	// 				},
	// 			}));
	// 		}
	// 	} else {
	// 		transaction.push(confDb.similar.update({
	// 			where: {
	// 				id: similar.id,
	// 			},
	// 			data: {
	// 				TvFrom: {
	// 					connect: {
	// 						id: similar.similarableId,
	// 					},
	// 				},
	// 			},
	// 		}));

	// 		if (tvs.includes(similar.mediaId)) {
	// 			transaction.push(confDb.similar.update({
	// 				where: {
	// 					id: similar.id,
	// 				},
	// 				data: {
	// 					TvTo: {
	// 						connect: {
	// 							id: similar.mediaId,
	// 						},
	// 					},
	// 				},
	// 			}));
	// 		}
	// 	}
	// }

	// const recommendations = await confDb.recommendation.findMany();
	// for (const recommendation of recommendations ?? []) {
	// 	if (recommendation.mediaType == 'movie') {
	// 		transaction.push(confDb.recommendation.update({
	// 			where: {
	// 				id: recommendation.id,
	// 			},
	// 			data: {
	// 				MovieFrom: {
	// 					connect: {
	// 						id: recommendation.recommendationableId,
	// 					},
	// 				},
	// 			},
	// 		}));

	// 		if (movies.includes(recommendation.mediaId)) {
	// 			transaction.push(confDb.recommendation.update({
	// 				where: {
	// 					id: recommendation.id,
	// 				},
	// 				data: {
	// 					MovieTo: {
	// 						connect: {
	// 							id: recommendation.mediaId,
	// 						},
	// 					},
	// 				},
	// 			}));
	// 		}
	// 	} else {
	// 		transaction.push(confDb.recommendation.update({
	// 			where: {
	// 				id: recommendation.id,
	// 			},
	// 			data: {
	// 				TvFrom: {
	// 					connect: {
	// 						id: recommendation.recommendationableId,
	// 					},
	// 				},
	// 			},
	// 		}));

	// 		if (tvs.includes(recommendation.mediaId)) {
	// 			transaction.push(confDb.recommendation.update({
	// 				where: {
	// 					id: recommendation.id,
	// 				},
	// 				data: {
	// 					TvTo: {
	// 						connect: {
	// 							id: recommendation.mediaId,
	// 						},
	// 					},
	// 				},
	// 			}));
	// 		}
	// 	}
	// }

	// await confDb.$transaction(transaction);

};


// await onDemand.fromFile(file, title);
// await onDemand.open(file);
// await onDemand.fromDatabase(Episode as unknown as EP);

// onDemand
//     .makeStack()
//     .check()
//     .start();

// onDemand.check();

//     const client = new ChromecastAPI();

// console.log(ffmpeg);
// console.log(ffmpeg.buildCommand());
// ffmpeg.start();

// await storeTvShow({
//     id: 30980,
//     folder: 'M:/Anime/Anime/A.Certain.Magical.Index.(2008)',
//     libraryId: 'cl7i4km1o0004qwef9472dy2t',
// });
// await storeTvShow({
//     id: 30977,
//     folder: 'M:/Anime/Anime/A.Certain.Scientific.Railgun.(2009)',
//     libraryId: 'cl7i4km1o0004qwef9472dy2t',
// });

// const files = readdirSync(`${imagesPath}`);

// for (const image of files) {
//     const stat = statSync(`${imagesPath}/${image}`);

//     if(stat.isDirectory()) continue;

//     if(stat.size == 0){
//         try {
//             rmSync(`${imagesPath}/${image}`);
//         } catch (error) {
//             console.log(error);
//         }
//         continue;
//     }

//     if(!image.endsWith('unknown')) continue;

//     try {
//         renameSync(`${imagesPath}/${image}`, `${imagesPath}/${image.replace('unknown','png')}`);
//     } catch (error) {
//         console.log(error);
//     }
// }

// const tv = await confDb.videoFile.findMany();

// const transaction: any[] = [];

// for (const video of tv) {
//     const newHostFolder = video.hostFolder.replace('Z:/mnt/m/', 'M:/');

//     transaction.push(confDb.videoFile.update({
//         where: {
//             id: video.id,
//         },
//         data: {
//             hostFolder: newHostFolder,
//         },
//     }));

// }

// await confDb.$transaction(transaction);

// const tv = await confDb.videoFile.findMany({
//     where: {
//         subtitles: {
//             contains: 'ass',
//         },
//     },
//     include: {
//         Episode: {
//             select: {
//                 id: true,
//                 tvId: true,
//                 title: true,
//             },
//         },
//     },
// });

// try {
//     const result = tv.map((t) => {
//         return {
//             episodeId: t.Episode?.id,
//             tvId: t.Episode?.tvId,
//             folder: `${t.hostFolder}/fonts`,
//             title: t.Episode?.title,
//         };
//     }).filter((t) => {
//         try {
//             return existsSync(t.folder) && !existsSync(`${t.folder}.json`);
//         } catch (error) {
//             return false;
//         }
//     });

//     for (const file of result) {
//         console.log(file.folder);
//         const files = readdirSync(file.folder)
//             .filter(f => f.endsWith('.ttf') || f.endsWith('.otf'));

//         const res = files.map((f) => {
//             return {
//                 file: f,
//                 mimeType: f.endsWith('.ttf')
//                     ? 'application/x-font-truetype'
//                     : 'application/x-font-opentype',
//             };
//         });

//         writeFileSync(`${file.folder}.json`, JSON.stringify(res));
//     }
// } catch (error) {
//     console.log(error);
// };

// const tv = await confDb.videoFile.findMany();

// try {
//     tv.forEach((t) => {
//         console.log(`${t.hostFolder}`);
//         // if (existsSync(`${t.hostFolder}/metadata`)) {
//         //     rmSync(`${t.hostFolder}/metadata`, { recursive: true });
//         // }

//         const files = readdirSync(`${t.hostFolder}`)
//             .filter(f => f.endsWith('.nfo') || f == 'metadata');

//         for (const file of files) {
//             console.log(`${t.hostFolder}/${file}`);
//             if (existsSync(`${t.hostFolder}/${file}`)) {
//                 rmSync(`${t.hostFolder}/${file}`, { recursive: true });
//             }
//         }
//     });
// } catch (error) {
//     console.log(error);
// }

// };
