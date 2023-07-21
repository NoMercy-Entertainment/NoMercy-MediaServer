// import {MusicBrainzApi} from 'musicbrainz-api';
// import { appVersion } from '@server/functions/system';
// import axios from 'axios';

// const musicBrainzApiClient = new MusicBrainzApi({
//     appName: 'NoMercy Mediaserver',
//     appVersion: appVersion,
//     appContactInfo: 'nomercy.tv'
// });

// export default musicBrainzApiClient;


// export const genresByRecording = async (releaseId: string) => {

//     const recording = await musicBrainzApiClient.lookupRecording(releaseId, [
//         'genres'
//     ]).catch(e => console.log(e));

//     return recording;

// }


// export interface Recording {
//     genres:               Genre[];
//     "first-release-date": string;
//     id:                   string;
//     length:               number;
//     disambiguation:       string;
//     title:                string;
//     video:                boolean;
// }

// export interface Genre {
//     count:          number;
//     name:           string;
//     disambiguation: string;
//     id:             string;
// }
