// import { selectLibraryWithRelations } from '@server/db/media/actions/libraries';

// import { medias } from '@server/db/media/schema/medias';
// import { transcodesPath } from '@server/state';
// import { exec, execSync } from 'child_process';
// import { eq } from 'drizzle-orm';
// import { existsSync, mkdirSync } from 'fs';
// import { medias } from "@server/db/media/schema/medias";
// import { transcodesPath } from "@server/state";
// import { execSync } from "child_process";
// import { like } from "drizzle-orm";
// import { existsSync, readdirSync, renameSync } from "fs";
// import { resolve } from "path";
// import { renameSync } from "fs";
// import { resolve } from "path";
// import { existsSync, mkdirSync } from "fs";
//
// import { tracks } from '@server/db/media/schema/tracks';
// import { inArray } from 'drizzle-orm';
// import { rmSync } from 'fs';
// import { readdirSync } from 'fs';
// import { execSync } from 'child_process';
// import { convertToHuman } from '@server/functions/dateTime';
// import { parseYear } from '../dateTime';

// import { insertLibraryMovie } from '@server/db/media/actions/library_movie';


export default async () => {

	// const files = readdirSync('C:\\Program Files (x86)\\Steam\\steamapps\\music\\Heartbound - OST');
	// for (const file of files) {
	// 	const path = `C:\\Program Files (x86)\\Steam\\steamapps\\music\\Heartbound - OST\\${file}`;
	// 	const tags = id3.read(path);
	// 	const duration = JSON.parse(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path}"`, { encoding: 'utf-8' }));
	// 	console.log(`${tags.trackNumber}. ${tags.title} - ${tags.artist} (${convertToHuman(duration)
	// 		.replace('00:00:0', '')
	// 		.replace('00:00:', '')})`);
	// }

	// const input = JSON.parse(readFileSync('H:\\C\\Downloads\\people.json', 'utf-8'));
	// console.log(input[0]);

	// writeFileSync('H:\\C\\Downloads\\people.json', JSON.stringify(input, null, 2));

	// const tracks = selectFromMusicPlays({ user_id: '6aa35c70-7136-44f3-baba-e1d464433426' });
	// console.log(tracks);

	// const episodes = globalThis.mediaDb.query.episodes.findMany({
	// 	where: (episode) => like(episode.title, '%’%'),
	// 	with: {
	// 		videoFiles: true,
	// 	},
	// });

	// for (const episode of episodes) {
	// 	for (const videoFile of episode.videoFiles) {
	// 		if(!existsSync(resolve(videoFile.hostFolder))){
	// 			continue;
	// 		}

	// 		const files = readdirSync(resolve(videoFile.hostFolder));

	// 		for (const file of files) {

	// 			const filename = file.replace(/’|‘/gu, '');

	// 			const originalFilename = resolve(videoFile.hostFolder, file);
	// 			const newFilename = resolve(videoFile.hostFolder, filename);

	// 			console.log(originalFilename, newFilename);
	// 			renameSync(originalFilename, newFilename);
	// 		}


	// 		if(!existsSync(resolve(videoFile.hostFolder, 'subtitles'))){
	// 			continue;
	// 		}

	// 		const files2 = readdirSync(resolve(videoFile.hostFolder, 'subtitles'));

	// 		for (const file of files2) {

	// 			const filename = file.replace(/’|‘/gu, '');

	// 			const originalFilename = resolve(videoFile.hostFolder, 'subtitles', file);
	// 			const newFilename = resolve(videoFile.hostFolder, 'subtitles', filename);

	// 			console.log(originalFilename, newFilename);
	// 			renameSync(originalFilename, newFilename);
	// 		}

	// 		// try {

	// 		// 	globalThis.mediaDb.update(videoFiles)
	// 		// 		.set({
	// 		// 			filename,
	// 		// 		})
	// 		// 		.where(eq(videoFiles.id, file.id!))
	// 		// 		.run();
	// 		// } catch (error) {

	// 		// }

	// 	}
	// }


	// const trailers = globalThis.mediaDb.query.medias.findMany({
	// 	where: eq(medias.site, 'YouTube'),
	// });
	// console.log(`Found ${trailers.length} trailers`);

	// for (const trailer of trailers) {

	// 	const url = `https://www.youtube.com/watch?v=${trailer.src}`;
	// 	const basePath = `${transcodesPath}/../trailers/${trailer.src}/`;

	// 	const cmd = [
	// 		'yt-dlp',
	// 		`"${url}"`,
	// 		'-f "bv+ba/b"',
	// 		'--write-auto-subs',
	// 		'--write-subs',
	// 		'--sub-format vtt',
	// 		'-o "subtitle:%(id)s.%(ext)s"',
	// 		'-o "%(id)s.%(ext)s"',
	// 	].join(' ');

	// 	await new Promise((resolve) => {

	// 		if (existsSync(`${basePath}/${trailer.src}.webm`)) {
	// 			resolve(true);

	// 		} else {

	// 			console.log(`Downloading ${trailer.src}`);

	// 			try {
	// 				execSync(`yt-dlp -F "${url}"`);

	// 				mkdirSync(`${basePath}`, { recursive: true });

	// 				exec(cmd, { cwd: `${basePath}` }, (error, stdout, stderr) => {
	// 					if (error) {
	// 						console.log(error);
	// 					}
	// 					if (stdout) {
	// 						console.log(stdout);
	// 					}
	// 					if (stderr) {
	// 						console.log(stderr);
	// 					}

	// 					resolve(true);
	// 				});
	// 			} catch (error) {
	// 				resolve(true);
	// 				// console.log(error);
	// 			}
	// 		}
	// 	});
	// }


	// const peoples = globalThis.mediaDb.query.people.findMany({
	// 	where: (table) => isNull(table.titleSort),
	// 	// with: {
	// 	// 	person_track: true,
	// 	// },
	// });

	// for (const [index, artist] of chunk(people, 10).entries()) {
	// 	globalThis.mediaDb.delete(people)
	// 		.where(inArray(people.id, artist.map(a => a.id)))
	// 		.run();

	// 	process.stdout.write(`Deleted ${index * 10} of ${people.length} people, ${Math.round((index * 10 / people.length) * 100)}%\r`);
	// }
	// for (const [index, person] of peoples.entries()) {
	// 	globalThis.mediaDb.update(people)
	// 		.set({
	// 			titleSort: createTitleSort(person.name as string),
	// 		})
	// 		.where(eq(people.id, person.id))
	// 		.run();

	// 	process.stdout.write(`Updated ${index} of ${peoples.length} people, ${Math.round((index / peoples.length) * 100)}%\r`);
	// }
};
