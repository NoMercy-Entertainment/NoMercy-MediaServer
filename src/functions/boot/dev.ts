import { confDb } from '@/database/config';
import { unique } from '../stringArray';
import { writeFileSync } from 'fs';

export default async () => {

	const posters: {title: string; src: string}[] = [];
	const backdrops: {title: string; src: string}[] = [];
	const profiles: {title: string; src: string}[] = [];

	await confDb.media.findMany({
		where: {
			type: 'poster',
			tvId: {
				not: null,
			},
		},
		take: 250,
		include: {
			Tv: true,
		},
		orderBy: {
			voteAverage: 'desc',
		},
	}).then((data) => {
		unique(data, 'tvId').forEach((d) => {
			if (d.src) {
				posters.push({
					title: d.Tv!.title,
					src: d.src,
				});
			}
		});
	});
	await confDb.media.findMany({
		where: {
			type: 'poster',
			movieId: {
				not: null,
			},
		},
		take: 250,
		include: {
			Movie: true,
		},
		orderBy: {
			voteAverage: 'desc',
		},
	}).then((data) => {
		unique(data, 'movieId').forEach((d) => {
			if (d.src) {
				posters.push({
					title: d.Movie!.title,
					src: d.src,
				});
			}
		});
	});
	await confDb.media.findMany({
		where: {
			type: 'backdrop',
			tvId: {
				not: null,
			},
		},
		take: 250,
		include: {
			Tv: true,
		},
		orderBy: {
			voteAverage: 'desc',
		},
	}).then((data) => {
		unique(data, 'tvId').forEach((d) => {
			if (d.src) {
				backdrops.push({
					title: d.Tv!.title,
					src: d.src,
				});
			}
		});
	});
	await confDb.media.findMany({
		where: {
			type: 'backdrop',
			movieId: {
				not: null,
			},
		},
		take: 250,
		include: {
			Movie: true,
		},
		orderBy: {
			voteAverage: 'desc',
		},
	}).then((data) => {
		unique(data, 'movieId').forEach((d) => {
			if (d.src) {
				backdrops.push({
					title: d.Movie!.title,
					src: d.src,
				});
			}
		});
	});
	await confDb.media.findMany({
		where: {
			type: 'profile',
			personId: {
				not: null,
			},
		},
		include: {
			Person: true,
		},
		take: 500,
		orderBy: {
			voteAverage: 'desc',
		},
	}).then((data) => {
		unique(data, 'personId').forEach((d) => {
			if (d.src) {
				profiles.push({
					title: d.Person!.name!,
					src: d.src,
				});
			}
		});
	});

	writeFileSync('figmaData.json', JSON.stringify({ posters, backdrops, profiles }));


	// const folder = 'D:/TV.Shows/Download/NCIS.(2003)';
	// const libraryId = 'cl7i4km1o0008qwef7qwdapxe';

	// const library = await confDb.library.findFirst({
	// 	where: {
	// 		id: libraryId,
	// 	},
	// 	include: {
	// 		EncoderProfiles: {
	// 			include: {
	// 				EncoderProfile: true,
	// 			},
	// 		},
	// 		Folders: {
	// 			include: {
	// 				folder: true,
	// 			},
	// 		},
	// 	},
	// });

	// const episodes = readdirSync(folder)
	// 	.map((f) => {
	// 		return {
	// 			path: `${folder}/${f}`,
	// 		};
	// 	})
	// 	.filter(f => f.path.endsWith('.mkv'));

	// for (const episode of episodes) {
	// 	try {
	// 		const onDemand = new FFMpegArchive();

	// 		onDemand.setLibrary(library!);
	// 		await onDemand.fromFile(episode.path);

	// 		onDemand
	// 			.verify()
	// 			.makeStack()
	// 			// .check();

	// 		if (onDemand.commands.length == 0) {
	// 			console.error('No commands to execute');
	// 		} else {
	// 			await onDemand.start(() => onDemand.buildSprite());
	// 		}
	// 	} catch (e) {
	// 		console.error(e);
	// 	}
	// };


	// const folder = 'D:/TV.Shows/Download/NCIS.(2003)';
	// const episodes = readdirSync(folder).map((f) => {
	// 	return {
	// 		path: `${folder}/${f}`,
	// 	};
	// });
	// await Promise.all([
	// await encodeFolder({ folder: 'M:/Films/Films/Cosmos.Laundromat.(2015)/original', libraryId: 'cl7i4km1o0006qwefdx5neusi' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/NCIS.(2003)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/Family.Guy.(1999)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/Love.Death.and.Robots.(2019)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/American.Dad.(2005)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/Rick.and.Morty.(2013)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/South.Park.(1997)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/The.Blacklist.(2013)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/The.Sandman.(2022)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/The.Cleveland.Show.(2009)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/Scooby-Doo.and.Scrappy-Doo.(1979)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/Popeye.the.Sailor.(1960)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/Dexter\'s.Laboratory.(1996)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// await encodeFolder({ folder: 'D:/TV.Shows/Download/NCIS.New.Orleans.(2014)', libraryId: 'cl7i4km1o0008qwef7qwdapxe' });
	// ]);

	// const fp = new FFmpegWrapper();

	// for (const episode of episodes.slice(0, 1)) {
	// 	await fp.open(episode);
	// 	await fp.detectSilence();
	// 	// const args = fp.silenceRanges.filter(s => s.duration > 1).map(s => ({ start: s.start, end: s.end }))[0];
	// 	writeFileSync('detect.json', JSON.stringify(fp, null, 2));
	// 	console.log(fp);
	// }

	// ripper();

	// const library = await confDb.library.findFirst({
	// 	where: {
	// 		id: 'cl7i4km1o0008qwef7qwdapxe',
	// 	},
	// 	include: {
	// 		EncoderProfiles: {
	// 			include: {
	// 				EncoderProfile: true,
	// 			},
	// 		},
	// 		Folders: {
	// 			include: {
	// 				folder: true,
	// 			},
	// 		},
	// 	},
	// });

	// confDb.similar.findMany({
	// 	where: {
	// 		OR: [
	// 			{
	// 				blurHash: null,
	// 			},
	// 			{
	// 				colorPalette: null,
	// 			},
	// 		],
	// 	},
	// })
	// 	.then(async (shows) => {

	// 		console.log(`Found ${shows.length} images to make blurHashes for`);

	// 		for (const tv of shows) {
	// 			console.log(`Making blurHash: ${tv.poster}`);

	// 			const palette: any = {
	// 				poster: undefined,
	// 				backdrop: undefined,
	// 			};

	// 			const blurHash: any = {
	// 				poster: undefined,
	// 				backdrop: undefined,
	// 			};

	// 			await Promise.all([
	// 				tv.poster && createBlurHash(`https://image.tmdb.org/t/p/w185${tv.poster}`).then((hash) => {
	// 					blurHash.poster = hash;
	// 				}),
	// 				tv.backdrop && createBlurHash(`https://image.tmdb.org/t/p/w185${tv.backdrop}`).then((hash) => {
	// 					blurHash.backdrop = hash;
	// 				}),
	// 				tv.poster && colorPalette(`https://image.tmdb.org/t/p/w185${tv.poster}`).then((hash) => {
	// 					palette.poster = hash;
	// 				}),
	// 				tv.backdrop && colorPalette(`https://image.tmdb.org/t/p/w185${tv.backdrop}`).then((hash) => {
	// 					palette.backdrop = hash;
	// 				}),
	// 			]);

	// 			await confDb.similar.update({
	// 				where: {
	// 					id: tv.id,
	// 				},
	// 				data: {
	// 					colorPalette: JSON.stringify(palette),
	// 					blurHash: JSON.stringify(blurHash),
	// 				},
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
