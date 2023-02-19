import { AppState, useSelector } from '../../state/redux';
import { Request, Response } from 'express';

import Device from 'chromecast-api/lib/device';
import { KAuthRequest } from 'types/keycloak';
import { OnDemand } from '../../functions/ffmpeg/onDemand';
import { deviceId } from '../../functions/system';
import { getLanguage } from '../middleware';
import { rmSync } from 'fs';
import { transcodesPath } from '../../state';

export default async (req: Request, res: Response) => {

	const file = req.body.file;
	const title = '2.Broke.Girls.NoMercy';
	const startTime = req.body.start ?? 0;
	const backdrop = 'fuAJWhDFO2unb6LpYFYgcw75KYZ.jpg';
	const isExternal = false;
	const subLang = 'eng';
	const audioLang = 'eng';

	const userId = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const language = getLanguage(req);

	const external_ip = useSelector((state: AppState) => state.system.external_ip);
	const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	const secureExternalPort = useSelector((state: AppState) => state.system.secureExternalPort);
	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	const ip = isExternal
		? external_ip.replace(/\./gu, '-')
		: internal_ip.replace(/\./gu, '-');

	const port = isExternal
		? secureExternalPort
		: secureInternalPort;

	const host = `https://${ip}.${deviceId}.nomercy.tv:${port}`;

	const path = Math.floor(Math.random() * 100000).toString();

	const onDemand = new OnDemand({ userId, file, title: path, startTime });

	try {
		await onDemand.open(file);
	} catch (error) {
		return res.status(404).json({
			status: 'error',
			error: error,
		});
	}

	onDemand
		.setPreferredAudioLanguage(audioLang)
		.setPreferredSubtitleLanguage(subLang)
		.toDisk(path)
		.makeStack()
	// .check()
		.start();

	setTimeout(() => {

		const media: Device.MediaResource = {
			url: `${host}/transcodes/${userId}/${path}/video.m3u8`,
			subtitles: [
				{
					language: language,
					url: `${host}/transcodes/${userId}/${path}/video_vtt.m3u8`,
					name: 'English',
				},
			],
			cover: {
				title: title,
				url: `https://www.themoviedb.org/t/p/original/${backdrop}`,
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

		const cast = useSelector((state: AppState) => state.system.cast);

		cast[0].play(media, (err) => {
			if (!err) console.log('Playing in your chromecast');
		});

		cast[0].on('finished', () => {
			rmSync(`${transcodesPath}/${userId}/${path}`, { recursive: true });
		});

	}, 2000);

	res.json({
		status: 'ok',
	});
};
