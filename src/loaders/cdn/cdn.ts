import {
	setAcousticId,
	setColors,
	setDownloads,
	setMakeMKVKey,
	setOmdbApiKey,
	setQuote,
	setTmdbApiKey
} from '@server/state/redux/config/actions';

import Logger from '@server/functions/logger';
import { platform } from '@server/functions/system';
import apiClient from '@server/functions/apiClient/apiClient';

const baseConfiguration = async () => {
	const response = await apiClient()
		.get('info')
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'setup',
				color: 'red',
				message: `Something went wrong while fetching the API info: ${JSON.stringify(error, null, 2)}`,
			});

			process.exit(1);
		});

	// setCDNData(response.data.data);
	setTmdbApiKey(response.data.data.keys.tmdb_key);
	process.env.TMDB_API_KEY = response.data.data.keys.tmdb_key;
	setOmdbApiKey(response.data.data.keys.omdb_key);
	process.env.OMDB_API_KEY = response.data.data.keys.omdb_key;
	setMakeMKVKey(response.data.data.keys.makemkv_key);
	process.env.MAKEMKV_KEY = response.data.data.keys.makemkv_key;
	setAcousticId(response.data.data.keys.acoustic_id);
	process.env.ACOUSTIC_ID = response.data.data.keys.acoustic_id;
	setAcousticId(response.data.data.keys.fanart_key);
	process.env.FANART_API_KEY = response.data.data.keys.fanart_key;
	setQuote(response.data.data.quote);
	setColors(response.data.data.colors);
	// console.log(response.data.data.downloads[platform]);
	setDownloads(response.data.data.downloads[platform]);

	return response.data.data;
};

export default baseConfiguration;
