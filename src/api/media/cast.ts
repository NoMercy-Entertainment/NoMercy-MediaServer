import { AppState, useSelector } from '../../state/redux';
import { Request, Response } from 'express';

import ChromecastAPI from 'chromecast-api';
import Device from 'chromecast-api/lib/device';

export default function (req: Request, res: Response) {

    const client = new ChromecastAPI();

    const media: Device.MediaResource = {
        url: `https://217-19-26-119.1968dcdc-bde6-4a0f-a7b8-5af17afd8fb6.nomercy.tv:7635/transcodes/${req.params.file}/video.m3u8`,
        subtitles: [
            {
                language: 'en-US',
                url: `https://217-19-26-119.1968dcdc-bde6-4a0f-a7b8-5af17afd8fb6.nomercy.tv:7635/transcodes/${req.params.file}/video_vtt.m3u8`,
                name: 'English',
            },
        ],
        cover: {
            title: '2 Broke Girls - S02E02 - And the Pearl Necklace',
            url: 'https://www.themoviedb.org/t/p/original/sAUC6TvmFWnePIcWV9fgz0sh8G2.jpg',
        },
        subtitles_style: {
            backgroundColor: '#FFFFFF00',
            foregroundColor: '#FFFFFFFF',
            edgeType: 'OUTLINE', // can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
            edgeColor: '#000000FF',
            fontScale: 1.2, // transforms into "font-size: " + (fontScale*100) +"%"
            fontStyle: 'BOLD', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
            fontFamily: 'Droid Sans',
            fontGenericFamily: 'SANS_SERIF', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
            // windowType: 'ROUNDED_CORNERS' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
        },
    };

	const socket = useSelector((state: AppState) => state.system.socket);

    client.on('device', (device) => {
        console.log(device.friendlyName);

        device.play(media, (err) => {
            if (!err) console.log('Playing in your chromecast');
            // console.log(err);
        });

        device.on('status', (status) => {
            socket.emit('cast_status', status);
            console.log(status);
        });

        device.on('connected', () => {
            socket.emit('cast_connected', device.friendlyName);

            socket.on('cast_resume', device.resume);
            socket.on('cast_pause', device.pause);
            socket.on('cast_stop', device.stop);
            socket.on('cast_seek', device.seek);
            socket.on('cast_seekTo', device.seekTo);
            socket.on('cast_changeSubtitles', device.changeSubtitles);
            socket.on('cast_subtitlesOff', device.subtitlesOff);
            // socket.on('cast_getCurrentTime', device.getCurrentTime(t => socket.emit('cast_current_time', t)));
            socket.on('cast_close', device.close);
        });

    });

    return res.json({
        status: 'ok',
    });
}
