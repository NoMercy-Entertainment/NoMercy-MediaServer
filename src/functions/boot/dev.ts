// import axios from 'axios';

// import { AppState, useSelector } from '../../state/redux';

// import ChromecastAPI from 'chromecast-api';
// import Device from 'chromecast-api/lib/device';
// import { OnDemand } from '../ffmpeg/onDemand';

export default async () => {

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

};
