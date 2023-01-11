// import { imagesPath } from "../../state";
// import { musicGenres } from "../../providers/musicbrainz/genre";
// import storeTvShow from "../../tasks/data/storeTvShow";

import { matchPercentage } from "../../functions/stringArray";
import { searchTv } from "../../providers/tmdb/search";

export default async () => {

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

    const result = await searchTv('Another', 2012)
        .then((tvs) => {
            let show = tvs[0];
            let match = 0;
            if (tvs.length > 1) {
                for (const tv of tvs) {
                    if (matchPercentage(tv.name, 'Another') > match) {
                        match = matchPercentage(tvs[0].name, 'Another');
                        show = tv;
                    }
                }
            }
            return show;
        })

        console.log(result)
    
}