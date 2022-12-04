// import { imagesPath } from "../../state";
// import { musicGenres } from "../../providers/musicbrainz/genre";
// import storeTvShow from "../../tasks/data/storeTvShow";


export default async () => {

    // const tracks = await confDb.track.findMany();

    // let duration = 0;

    // for (const track of tracks) {
    //     duration += convertToSeconds(track.duration);
    // }

    // console.log({count: tracks.length, duration: convertToHuman(duration)})

    // const arr1: number[] = JSON.parse(execSync(`ffmpeg -i "M:\\TV.Shows\\TV.Shows\\NCIS.(2003)\\NCIS.S01E01\\NCIS.S01E01.Yankee.White.NoMercy.mp4" -f wav - | audiowaveform --input-format wav  -o "C:\\Users\\Stoney\\Music\\prints\\NCIS.S01E01.Yankee.White.NoMercy.json" -b 16 -z 256`).toString()).data;
    // const arr2: number[] = JSON.parse(execSync(`ffmpeg -i "M:\\TV.Shows\\TV.Shows\\NCIS.(2003)\\NCIS.S01E02\\NCIS.S01E02.Hung.Out.to.Dry.NoMercy.mp4" -f wav - | audiowaveform --input-format wav -o "C:\\Users\\Stoney\\Music\\prints\\NCIS.S01E02.Hung.Out.to.Dry.NoMercy.json" -b 16 -z 256`).toString()).data;

    // return new Promise((resolve, reject) => {
        // execSync(`ffmpeg -i "M:\\TV.Shows\\TV.Shows\\NCIS.(2003)\\NCIS.S01E01\\NCIS.S01E01.Yankee.White.NoMercy.mp4" -f wav - | audiowaveform --input-format wav -o "C:\\Users\\Stoney\\Music\\prints\\NCIS.S01E01.Yankee.White.NoMercy.json" -b 8 -z 256`);
        // execSync(`ffmpeg -i "M:\\TV.Shows\\TV.Shows\\NCIS.(2003)\\NCIS.S01E02\\NCIS.S01E02.Hung.Out.to.Dry.NoMercy.mp4" -f wav - | audiowaveform --input-format wav -o "C:\\Users\\Stoney\\Music\\prints\\NCIS.S01E02.Hung.Out.to.Dry.NoMercy.json" -b 8 -z 256`);
        // execSync(`ffmpeg -i "M:\\TV.Shows\\TV.Shows\\NCIS.(2003)\\NCIS.S01E03\\NCIS.S01E03.Seadog.NoMercy.mp4" -f wav - | audiowaveform --input-format wav -o "C:\\Users\\Stoney\\Music\\prints\\NCIS.S01E03.Seadog.NoMercy.json" -b 8 -z 256`);
    
        // const arr1: number[] = JSON.parse(readFileSync('C:\\Users\\Stoney\\Music\\prints\\NCIS.S01E01.Yankee.White.NoMercy.json', 'utf8')).data;
        // const arr2: number[] = JSON.parse(readFileSync('C:\\Users\\Stoney\\Music\\prints\\NCIS.S01E02.Hung.Out.to.Dry.NoMercy.json', 'utf8')).data;
        // const arr3: number[] = JSON.parse(readFileSync('C:\\Users\\Stoney\\Music\\prints\\NCIS.S01E03.Seadog.NoMercy.json', 'utf8')).data;
    
        // console.log(arr1.length);
        // let data: any = null;
        // let data2: any = null;
        
        // for (let i = 0; i < arr1.length; i++) {
    
        //     const indA1 = arr2.indexOf(arr1[i]);
        //     const indB1 = arr3.indexOf(arr2[i]);
        //     const indA2 = arr2.indexOf(arr1[i + 1]);
        //     const indB2 = arr3.indexOf(arr2[i + 1]);
        //     const indA3 = arr2.indexOf(arr1[i + 2]);
        //     const indB3 = arr3.indexOf(arr2[i + 2]);
        //     const indA4 = arr2.indexOf(arr1[i + 3]);
        //     const indB4 = arr3.indexOf(arr2[i + 3]);
        //     const indA5 = arr2.indexOf(arr1[i + 4]);
        //     const indB5 = arr3.indexOf(arr2[i + 4]);
        //     const indA6 = arr2.indexOf(arr1[i + 5]);
        //     const indB6 = arr3.indexOf(arr2[i + 5]);
        //     const indA7 = arr2.indexOf(arr1[i + 6]);
        //     const indB7 = arr3.indexOf(arr2[i + 6]);
        //     const indA8 = arr2.indexOf(arr1[i + 7]);
        //     const indB8 = arr3.indexOf(arr2[i + 7]);
        //     const indA9 = arr2.indexOf(arr1[i + 8]);
        //     const indB9 = arr3.indexOf(arr2[i + 8]);
        //     const indA10 = arr2.indexOf(arr1[i + 9]);
        //     const indB10 = arr3.indexOf(arr2[i + 9]);
    
        //     if(
        //         indA2 - indA1 == 1 
        //         && indA3 - indA2 == 1 
        //         && indA4 - indA3 == 1 
        //         && indA5 - indA4 == 1 
        //         && indA6 - indA5 == 1 
        //         && indA7 - indA6 == 1 
        //         && indA8 - indA7 == 1 
        //         && indA9 - indA8 == 1 
        //         && indA10 - indA9 == 1
        //     ){
        //         data = {indA1,indA2, indA3, indA4, indA5, indA6, indA7, indA8, indA9, indA10};
        //     }
        //     else if(
        //         indA2 - indA1 == 1 
        //         && indA3 - indA2 == 1 
        //         && indA4 - indA3 == 1 
        //         && indA5 - indA4 == 1 
        //         && indA6 - indA5 == 1 
        //         && indA7 - indA6 == 1 
        //         && indA8 - indA7 == 1 
        //         && indA9 - indA8 == 1 
        //     ){
        //         data =  {indA1,indA2, indA3, indA4, indA5, indA6, indA7, indA8, indA9};
        //     }
        //     else if(
        //         indA2 - indA1 == 1 
        //         && indA3 - indA2 == 1 
        //         && indA4 - indA3 == 1 
        //         && indA5 - indA4 == 1 
        //         && indA6 - indA5 == 1 
        //         && indA7 - indA6 == 1 
        //         && indA8 - indA7 == 1 
        //     ){
        //         data =  {indA1,indA2, indA3, indA4, indA5, indA6, indA7, indA8};
        //     }
        //     else if(
        //         indA2 - indA1 == 1 
        //         && indA3 - indA2 == 1 
        //         && indA4 - indA3 == 1 
        //         && indA5 - indA4 == 1 
        //         && indA6 - indA5 == 1 
        //         && indA7 - indA6 == 1 
        //     ){
        //         data =  {indA1,indA2, indA3, indA4, indA5, indA6, indA7};
        //     }
        //     else if(
        //         indA2 - indA1 == 1 
        //         && indA3 - indA2 == 1 
        //         && indA4 - indA3 == 1 
        //         && indA5 - indA4 == 1 
        //         && indA6 - indA5 == 1 
        //     ){
        //         data =  {indA1,indA2, indA3, indA4, indA5, indA6};
        //     }
        //     else if(
        //         indA2 - indA1 == 1 
        //         && indA3 - indA2 == 1 
        //         && indA4 - indA3 == 1 
        //         && indA5 - indA4 == 1 
        //     ){
        //         data =  {indA1,indA2, indA3, indA4, indA5};
        //     }
    
            // if(
            //     indA2 - indA1 == 1 
            //     && indA3 - indA2 == 1 
            //     && indA4 - indA3 == 1 
            //     && !data
            // ){
            //     data = {item, indA1,indA2, indA3, indA4};
            // }
            // else if(
            //     indA2 - indA1 == 1 
            //     && indA3 - indA2 == 1 
            // ){
            //     console.log({item, indA1,indA2, indA3});
            // }
            
    //         if(
    //             indB2 - indB1 == 1 
    //             && indB3 - indB2 == 1 
    //             && indB4 - indB3 == 1 
    //             && indB5 - indB4 == 1 
    //             && indB6 - indB5 == 1 
    //             && indB7 - indB6 == 1 
    //             && indB8 - indB7 == 1 
    //             && indB9 - indB8 == 1 
    //             && indB10 - indB9 == 1
    //         ){
    //             data2 = {indB1,indB2, indB3, indB4, indB5, indB6, indB7, indB8, indB9, indB10};
    //         }
    //         else if(
    //             indB2 - indB1 == 1 
    //             && indB3 - indB2 == 1 
    //             && indB4 - indB3 == 1 
    //             && indB5 - indB4 == 1 
    //             && indB6 - indB5 == 1 
    //             && indB7 - indB6 == 1 
    //             && indB8 - indB7 == 1 
    //             && indB9 - indB8 == 1 
    //         ){
    //             data2 =  {indB1,indB2, indB3, indB4, indB5, indB6, indB7, indB8, indB9};
    //         }
    //         else if(
    //             indB2 - indB1 == 1 
    //             && indB3 - indB2 == 1 
    //             && indB4 - indB3 == 1 
    //             && indB5 - indB4 == 1 
    //             && indB6 - indB5 == 1 
    //             && indB7 - indB6 == 1 
    //             && indB8 - indB7 == 1 
    //         ){
    //             data2 =  {indB1,indB2, indB3, indB4, indB5, indB6, indB7, indB8};
    //         }
    //         else if(
    //             indB2 - indB1 == 1 
    //             && indB3 - indB2 == 1 
    //             && indB4 - indB3 == 1 
    //             && indB5 - indB4 == 1 
    //             && indB6 - indB5 == 1 
    //             && indB7 - indB6 == 1 
    //         ){
    //             data2 =  {indB1,indB2, indB3, indB4, indB5, indB6, indB7};
    //         }
    //         else if(
    //             indB2 - indB1 == 1 
    //             && indB3 - indB2 == 1 
    //             && indB4 - indB3 == 1 
    //             && indB5 - indB4 == 1 
    //             && indB6 - indB5 == 1 
    //         ){
    //             data2 =  {indB1,indB2, indB3, indB4, indB5, indB6};
    //         }
    //         else if(
    //             indB2 - indB1 == 1 
    //             && indB3 - indB2 == 1 
    //             && indB4 - indB3 == 1 
    //             && indB5 - indB4 == 1 
    //         ){
    //             data2 =  {indB1,indB2, indB3, indB4, indB5};
    //         }
    
    //         if(
    //             indB2 - indB1 == 1 
    //             && indB3 - indB2 == 1 
    //             && indB4 - indB3 == 1 
    //             && !data
    //         ){
    //             data2 = {indB1,indB2, indB3, indB4};
    //         }
    //         else if(
    //             indB2 - indB1 == 1 
    //             && indB3 - indB2 == 1 
    //         ){
    //             data2 = {indB1,indB2, indB3};
    //         }
            
    //     }
        
    //     resolve({data, data2})
    
    // });


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

    // const genres = await musicGenres();
    // console.log(genres);

    // const response = await track('44dc19cb-fe11-4e79-9d52-b5866812f2e0');
    // console.log(response);


    // await confDb.track.findMany({
    //     where: {
    //         folder: {
    //             contains: '/Music',
    //         }
    //     },
    // }).then(async (tracks) => {

    //     for (const track of tracks) {

    //         const newFolder = track.folder.replace('/Music','');
            
    //         await confDb.track.update({
    //             where: {
    //                 id: track.id
    //             },
    //             data: {
    //                 folder: newFolder
    //             }
    //         });
    //     }

    // });




    // for (const image of images) {
    //     console.log(`Z:/mnt/m/Music${image.folder}${image.cover}`);
    //     try {
    //         rmSync(`Z:/mnt/m/Music${image.folder}${image.cover}`);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    
}