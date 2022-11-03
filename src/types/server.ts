import { Collection, Genre, GenreMovie, GenreTv, Recommendation, Similar, UserData } from '@prisma/client';

import { Movie } from '../providers/tmdb/movie';
import { Socket } from 'socket.io-client';
import { TvShow } from '../providers/tmdb/tv';
import { Video } from '../providers/tmdb/shared';

export interface MediaServer {
	connected: boolean;
	currentServer: Server;
	servers: Server[];
	loading: boolean;
	error: string | null;
	locations: ServerLocation[];
	serverClients: ServerClient[];
	socket: Socket | null;
}
export interface OwnerDetails {
	local_address: string;
	name: string;
	server_id: string;
	address: string;
}
export interface ServerLocation {
	auto_connect: boolean;
	server_id: string;
	port: number;
	is_owner: true;
	owner: string;
	online: boolean;
	owner_details: OwnerDetails;
	domain: string;
	server_name: string;
	platform: string;
}
export interface Server {
	auto_connect: boolean;
	location: string;
	is_owner: boolean;
	server_id: string;
	online: boolean;
	setupComplete: boolean;
	owner: string;
	server_name: string;
	platform: string;
}
export interface ServerClient {
	socket_id: string;
	id: string;
	name: string;
	type: string;
	connected: boolean;
	active_device: boolean;
}
export type Message = {
	body?: string;
	from?: string;
	id?: number;
	image?: string;
	notify?: boolean;
	read?: boolean;
	title?: string;
	to?: string;
	type?: string;
	method?: string;
	created_at?: number;
	updated_at?: number;
};

export interface Library {
	id: string;
	image: string;
	title: string;
	type: string;
	folders: string[];
	language: Language['iso_639_1'];
	country: Country['iso_3166_1'];
	specialSeasonName: string;
	realtime: boolean;
	metadata: {
		show: {
			name: string;
			val: string;
		}[];
		season: {
			name: string;
			val: string;
		}[];
		episode: {
			name: string;
			val: string;
		}[];
	};
	autoRefreshInterval: string;
	chapterImages: boolean;
	extractChapters: boolean;
	extractChaptersDuring: boolean;
	subtitles: Language['iso_639_1'][];
	perfectSubtitleMatch: boolean;
	encoderProfiles: string[];
	created_at?: number;
	updated_at?: number;
	content: InfoResponse[];
}

export interface Language {
	iso_639_1: string;
	english_name: string;
	label: string;
}

export interface Country {
	iso_3166_1: string;
	english_name: string;
	label: string;
}

export interface EncoderProfile {
	id: string;
	name: string;
	container: KeyVal[];
	params: KeyVal[];
	created_at?: number;
	updated_at?: number;
}

export interface KeyVal {
	key: string;
	val: string;
}

export interface NameVal {
	name: string;
	value: string;
}

export interface SystemPath {
	key: string;
	value: string;
}
export interface Device {
	id: string;
	title: string;
	type: string;
	version: string;
	deviceId: string;
	created_at?: number;
	updated_at?: number;
}
export interface ActivityLog {
	sub_id: string;
	deviceId: string;
	type: string;
	time: number;
	from: string;
	created_at?: number;
	updated_at?: number;
}
export interface ServerInfo {
	server: string;
	os: string;
	arch: string;
	version: string;
	bootTime: number;
}
export interface ServerTask {
	id: string;
	title: string;
	value: number;
	type: string;
	created_at?: number;
	updated_at?: number;
}

export interface MediaResponse extends TvShow, Movie {
	id: number;
	poster: string | null;
	title: string;
	titleSort: string;
	type: string;
	mediaType: string;
	numberOfEpisodes: number;
	haveEpisodes: number;
}

export interface InfoResponse {
	id: number;
	duration: number | null;
	backdrop: string | null;
	poster: string | null;
	title: string;
	overview: string | null;
	name?: string;
	titleSort: string;
	voteAverage: number | null;
	contentRatings: any[];
	year: number;
	numberOfEpisodes?: number;
	haveEpisodes?: number;
	backdrops: MediaItem[];
	posters: MediaItem[];
	logos: MediaItem[];
	genres: Item[];
	creators?: Item[];
	directors: Item[];
	writers: Item[];
	keywords: string[];
	budget?: number | null;
	type: string;
	mediaType: string;
	favorite: boolean;
	watched: boolean;
	externalIds: {
		imdbId: string | null;
		tvdbId: number | null;
	};
	cast: InfoCredit[];
	crew: InfoCredit[];
	director: Item[];

	videos: ExtendedVideo[];
	similar: Similar[];
	recommendations: Recommendation[];
}

export interface Item {
	id: number | string;
	name: string;
}

export interface MediaItem {
	aspectRatio: number;
	createdAt: string;
	height: number;
	id: number;
	iso6391: string | null;
	name: string | null;
	site: string | null;
	size: string | null;
	profilePath?: string | null;
	poster?: string | null;
	backdrop?: string | null;
	src: string;
	type: string;
	updatedAt: string;
	voteAverage: number;
	voteCount: number;
	width: number;
	colorPalette: PaletteColors;
}

export interface InfoCredit {
	gender: number | null;
	id: number;
	job?: string | null;
	department?: string | null;
	character?: string | null;
	knownForDepartment: string | null;
	name: string | null;
	profilePath: string | null;
	popularity: number | null;
	deathday: string | null | undefined;
}

export interface ExtendedVideo extends Video {
	src: string;
}

export interface LibraryResponse {
	id: string;
	autoRefreshInterval: string;
	chapterImages: boolean;
	extractChapters: boolean;
	extractChaptersDuring: boolean;
	image: null | string;
	perfectSubtitleMatch: boolean;
	realtime: boolean;
	specialSeasonName: string;
	title: string;
	type: string;
	country: string;
	language: string;
	created_at: string;
	updated_at: string;
	folders: FolderElement[];
	content: LibraryResponseContent[];
}

export interface FolderElement {
	libraryId: string;
	folderId: string;
	folder: FolderFolder;
}

export interface FolderFolder {
	id: string;
	path: string;
	created_at: string;
	updated_at: string;
}

export interface LibraryResponseContent {
	id: number;
	poster: string | null;
	backdrop?: string | null;
	logo?: string | null;
	overview?: string | null;
	favorite?: boolean;
	watched?: boolean;
	title: string;
	titleSort: string;
	type: string;
	mediaType: string;
	numberOfEpisodes?: number;
	haveEpisodes?: number;
	genres?: Genre[] | GenreTv[] | GenreMovie[];
	year?: number | '';
	files?: Array<number | null> | undefined;
	collection?: LibraryResponseContent[] | undefined;
}

export interface ConfigData {
	[arg: string]: boolean | string | number;
}

export interface AddUserParams {
	sub_id: string;
	email: string;
	name: string;
}
export interface removeUserParams {
	sub_id: string;
}
export interface userPermissionsParams {
	sub_id: string;
}
export interface userPermissionsParams {
	sub_id: string;
	allowed: boolean;
	manage: boolean;
	audioTranscoding: boolean;
	videoTranscoding: boolean;
	noTranscoding: boolean;
	libraries: string[];
}
export interface NotificationsParams {
	sub_id: string;
	name: string;
	notificationIds: string[];
}

export interface updateEncoderProfilesParams extends Library {
	sub_id: string;
}
export interface updateEncoderProfilesParams extends Library {
	sub_id: string;
}

export interface ResponseStatus {
	status: string;
	message: string;
}

export interface ConfigParams {
	secureInternalPort: number;
	secureExternalPort: number;
	deviceName: string;
	queueWorkers: number;
	cronWorkers: number;
}

export interface UserDataResponse {
	success: boolean;
	data: UserData;
	message: string;
}

export interface ContinueWatching {
	id: number;
	mediaType: string;
	poster: string;
	title: string;
	titleSort: string;
	type: string;
}

export interface PaletteColors {
	primary?: string;
	lightVibrant?: string;
	darkVibrant?: string;
	lightMuted?: string;
	darkMuted?: string;
}

export interface LogoResponse {
    aspectRatio: number | null;
    src: string;
	colorPalette: PaletteColors;
    meta: {
        title: string | undefined;
        tags: string[] | undefined;
        logo: {
            aspectRatio: number | null;
            src: string;
        } | null;
    } | null;
}

export interface UserPermissions {
	edit: boolean;
}