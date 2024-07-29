import { env } from '@server/functions/system';

export default {
	TADB_API_KEY: env('TADB_API_KEY'),
	TMDB_API_KEY: env('TMDB_API_KEY'),
	TMDB_API_TOKEN: env('TMDB_API_TOKEN'),
	TVDB_API_KEY: env('TVDB_API_KEY'),
	OMDB_API_KEY: env('OMDB_API_KEY'),
	ROTTEN_API_KEY: env('ROTTEN_API_KEY'),
	FANART_API_KEY: env('FANART_API_KEY'),
	FANART_CLIENT_KEY: env('FANART_CLIENT_KEY'),
	MUSIXMATCH_API_KEY: env('MUSIXMATCH_API_KEY'),
	ACOUSTIC_ID: env('ACOUSTIC_ID'),
	JWPLAYER_KEY: env('JWPLAYER_KEY'),
};
