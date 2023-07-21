
import { convertToSeconds } from '@server/functions/dateTime';

import { deviceId } from '@server/functions/system';
import i18next from 'i18next';
import { sortBy } from '@server/functions/stringArray';
import { PlaylistItem } from '@server/types//video';
import { AppState, useSelector } from '@server/state/redux';
import { Episode } from '@server/db/media/actions/episodes';
import { Media } from '@server/db/media/actions/medias';
import { Translation } from '@server/db/media/actions/translations';
import { Tv } from '@server/db/media/actions/tvs';
import { CertificationTv } from '@server/db/media/actions/certification_tv';
import { Certification } from '@server/db/media/actions/certifications';
import { FolderLibrary } from '@server/db/media/actions/folder_library';
import { Folder } from '@server/db/media/actions/folders';
import { VideoFile } from '@server/db/media/actions/videoFiles';
import { UserData } from '@server/db/media/actions/userData';
import { Library } from '@server/db/media/actions/libraries';

export type PlaylistItemData = (Episode & {
	Media: Media[];
	Translation: Translation[];
	Tv: Tv & {
		Certification: (CertificationTv & {
			Certification: Certification | null;
		})[];
		Media: Media[];
		Library: (Library & {
			Folders: (FolderLibrary & {
				folder: Folder | null;
			})[];
		});
		Translation: Translation[];
	};
	VideoFile?: (VideoFile & {
		UserData: UserData[];
	})[];
});

export default ({ data }: { data: PlaylistItemData; }): PlaylistItem => {

	const access_token = useSelector((state: AppState) => state.user.access_token);

	const videoFile = data.VideoFile?.[0];

	const showTitle = data.Tv.Translation[0]?.title;

	const episodeTranslations = data.Translation[0];

	const overview = episodeTranslations?.overview != '' && episodeTranslations?.overview != null
		? episodeTranslations?.overview
		: data.overview;

	const title = episodeTranslations?.title != '' && episodeTranslations?.title != null
		? episodeTranslations?.title
		: data.title;

	const show = showTitle != '' && showTitle != null
		? showTitle
		: data.Tv.title;

	const textTracks: any[] = [];

	const baseFolder = `/${videoFile?.share}${videoFile?.folder}`;

	JSON.parse(videoFile?.subtitles ?? '[]').forEach((sub) => {
		const { language, type, ext } = sub;

		textTracks.push({
			label: type,
			src: `${baseFolder}/subtitles${videoFile?.filename.replace(/\.mp4|\.m3u8/u, '')}.${language}.${type}.${ext}`,
			srclang: i18next.t(`languages:${language}`),
			language: language,
			kind: 'subtitles',
		});
	});

	return {
		id: data.id,
		title: title as string,
		description: overview,
		duration: videoFile?.duration,
		special_id: undefined,
		poster: data.Tv.poster
			? data.Tv.poster
			: null,
		backdrop: data.Tv.backdrop
			? data.Tv.backdrop
			: null,

		image: data.still ?? data.Tv.poster
			? data.still ?? data.Tv.poster
			: null,

		year: data.Tv.firstAirDate?.split('-')[0] ?? '',
		video_type: 'tv',
		production: data.Tv.status != 'Ended',
		season: data.seasonNumber,
		episode: data.episodeNumber,
		episode_id: data.id,
		origin: deviceId,
		uuid: data.Tv.id + data.id,
		video_id: videoFile?.id as string,
		tmdbid: data.Tv.id,
		show: show,
		playlist_type: 'tv',
		logo: data.Tv.Media.find(m => m.type == 'logo')?.src ?? null,
		rating:
			data.Tv.Certification.map((cr) => {
				return {
					country: cr.iso31661 as string,
					rating: cr.Certification?.rating,
					meaning: cr.Certification?.meaning,
					image: `/${cr.iso31661}/${cr.iso31661}_${cr.Certification?.rating}.svg`,
				};
			})?.[0] ?? null,

		progress: data.VideoFile && data.VideoFile?.[0]?.UserData?.[0]?.time
			? (data.VideoFile[0].UserData[0].time / convertToSeconds(data.VideoFile[0].duration)) * 100
			: null,

		textTracks: sortBy(textTracks, 'language'),
		sources: [
			{
				src: `${baseFolder}${videoFile?.filename}${videoFile?.filename.includes('.mp4')
					? `?token=${access_token}`
					: ''}`,
				type: videoFile?.filename.includes('.mp4')
					? 'video/mp4'
					: 'application/x-mpegURL',
				languages: JSON.parse(videoFile?.languages ?? '[]'),
			},
		].filter(s => !s.src.includes('undefined')),

		tracks: [
			{
				file: `${baseFolder}/previews.vtt`,
				kind: 'thumbnails',
			},
			{
				file: `${baseFolder}/chapters.vtt`,
				kind: 'chapters',
			},
			{
				file: `${baseFolder}/sprite.webp`,
				kind: 'sprite',
			},
			{
				file: `${baseFolder}/fonts.json`,
				kind: 'fonts',
			},
		],
	};

};
