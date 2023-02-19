import axios from 'axios';
import { convertToSeconds } from '../functions/dateTime';

export async function findLyrics(info: any): Promise<string> {

	const headers = {
		authority: 'apic-desktop.musixmatch.com',
		cookie: 'x-mxm-token-guid=',
	};

	const baseURL = 'https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get?format=json&namespace=lyrics_richsynched&subtitle_format=mxm&app_id=web-desktop-app-v1.0&';

	const duration = convertToSeconds(info.duration);
	const userToken = '200501593b603a3fdc5c9b4a696389f6589dd988e5a1cf02dfdce1';

	const params = {
		q_album: info.Album?.[0]?.name ?? info.Album?.[0].title,
		q_artist: info.Artist?.[0]?.name,
		q_artists: info.Artist.map(a => a.name),
		q_track: info.name,
		q_duration: duration,
		// f_subtitle_length: Math.floor(duration),
		usertoken: userToken,
	};

	const finalURL
		= baseURL
		+ Object.keys(params)
			.map(key => `${key}=${encodeURIComponent(params[key])}`)
			.join('&');

	const { data } = await axios.get(finalURL, { headers: headers });

	return data.message.body.macro_calls?.['track.subtitles.get']?.message?.body?.subtitle_list?.[0]?.subtitle?.subtitle_body
		?? data.message.body.macro_calls?.['track.lyrics.get']?.message?.body?.lyrics?.lyrics_body;

}
