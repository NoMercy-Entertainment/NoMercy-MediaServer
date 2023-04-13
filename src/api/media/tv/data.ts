import { DirectoryTree } from 'directory-tree';
import { readdirSync } from 'fs';
import i18next from 'i18next';
import { join } from 'path';

import {
	Certification, CertificationTv, Episode, Folder, Library, LibraryFolder, Media, Translation, Tv,
	UserData, VideoFile
} from '../../../database/config/client';
import { VideoFFprobe } from '../../../encoder/ffprobe/ffprobe';
import { convertToSeconds, humanTime } from '../../../functions/dateTime';
import { getQualityTag } from '../../../functions/ffmpeg/quality/quality';
import { getExistingSubtitles } from '../../../functions/ffmpeg/subtitles/subtitle';
import { sortBy } from '../../../functions/stringArray';
import { deviceId } from '../../../functions/system';
import {
	filenameParse, ParsedFilename, ParsedTvInfo
} from '../../../functions/videoFilenameParser';
import { createBaseFolder, EP, parseFileName } from '../../../tasks/files/filenameParser';

export type PlaylistItem = (Episode & {
	Media: Media[];
	Translation: Translation[];
	Tv: Tv & {
    Certification: (CertificationTv & {
        Certification: Certification | null;
    })[];
	Media: Media[];
	Library: (Library & {
		Folders: (LibraryFolder & {
			folder: Folder | null;
		})[]
	})
	Translation: Translation[];
	};
	VideoFile?: (VideoFile & {
		UserData: UserData[];
	})[];
});

export default async ({ data }: { data: PlaylistItem }) => {

	let videoFile = data.VideoFile?.[0];

	if (!videoFile) {

		const baseFolder = createBaseFolder(data as unknown as EP);

		const folder = join(data.Tv.Library.Folders[0].folder!.path, baseFolder);
		const list = readdirSync(folder);
		const f = list.find((l) => {
			const x: ParsedFilename = filenameParse(l, data.Tv.Library.type == 'tv');
			const s = (x as ParsedTvInfo)?.seasons?.[0] ?? undefined;
			const e = (x as ParsedTvInfo)?.episodeNumbers?.[0] ?? undefined;

			return (s ?? 1) === data.seasonNumber && e === data.episodeNumber;
		}) ?? '';

		const filePath = join(folder, f);

		const file = await parseFileName({ path: filePath, name: '', size: 0, type: 'file' } as DirectoryTree<{[key: string]: any; }>, true);

		if (!file?.ffprobe) {
			return;
		}

		videoFile = {
			id: 0,
			UserData: [],
			episodeId: 0,
			movieId: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
			filename: file.ffprobe.format.filename.replace(/.+[\\\/](.+)/u, '/$1'),
			folder: baseFolder,
			hostFolder: file.ffprobe.format.filename.replace(/(.+)[\\\/].+/u, '$1'),
			duration: humanTime(file.ffprobe.format.duration),
			quality: JSON.stringify(getQualityTag(file.ffprobe)),
			share: `${data.Tv.libraryId}/`,
			subtitles: JSON.stringify(getExistingSubtitles(file.ffprobe as VideoFFprobe)),
			languages: JSON.stringify((file.ffprobe as VideoFFprobe).streams.audio.map(a => a.language)),
			Chapters: JSON.stringify((file.ffprobe as VideoFFprobe).chapters),
		};
	}

	const showTitle = data.Tv.Translation[0].title;

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
		title: title,
		description: overview,
		duration: videoFile?.duration,

		poster: data.Tv.poster
			? data.Tv.poster
			: null,
		backdrop: data.Tv.backdrop
			? data.Tv.backdrop
			: null,

		image: data.still ?? data.Tv.poster
			? data.still ?? data.Tv.poster
			: null,

		year: data.Tv.firstAirDate?.split('-')[0] ?? null,
		video_type: 'tv',
		production: data.Tv.status != 'Ended',
		season: data.seasonNumber,
		episode: data.episodeNumber,
		episode_id: data.id,
		origin: deviceId,
		uuid: data.Tv.id + data.id,
		video_id: videoFile?.id,
		tmdbid: data.Tv.id,
		show: show,
		playlist_type: 'tv',
		logo: data.Tv.Media.find(m => m.type == 'logo')?.src ?? null,
		rating:
			data.Tv.Certification.map((cr) => {
				return {
					country: cr.iso31661,
					rating: cr.Certification?.rating,
					meaning: cr.Certification?.meaning,
					image: `/${cr.iso31661}/${cr.iso31661}_${cr.Certification?.rating}.svg`,
				};
			})?.[0] ?? {},

		progress: data.VideoFile && data.VideoFile?.[0]?.UserData?.[0]?.time
			? (data.VideoFile[0].UserData[0].time / convertToSeconds(data.VideoFile[0].duration)) * 100
			: null,

		textTracks: sortBy(textTracks, 'language'),
		sources: [
			{
				src: `${baseFolder}${videoFile?.filename.replace('.mkv', '.m3u8')}`,
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
