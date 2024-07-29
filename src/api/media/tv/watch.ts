import { Request, Response } from 'express-serve-static-core';

import { Tv, TvPlaybackWithRelations, getTvPlayback } from '@server/db/media/actions/tvs';
import i18next from 'i18next';
import { convertToSeconds, parseYear } from '@server/functions/dateTime';
import { getClosestRating, sortBy } from '@server/functions/stringArray';
import { existsSync, readFileSync } from 'fs';
import { deviceId } from '@server/functions/system';
import { Episode } from '@server/db/media/actions/episodes';
import { Translation } from '@server/db/media/actions/translations';
import { VideoFile } from '@server/db/media/actions/videoFiles';
import { UserData } from '@server/db/media/actions/userData';
import { CertificationTv } from '@server/db/media/actions/certification_tv';
import { Certification } from '@server/db/media/actions/certifications';
import { requestWorker } from '@server/api/requestWorker';
import { PlaylistItem } from '@server/types/video';
import { Image } from '@server/db/media/actions/images';
import { Season } from '@server/db/media/actions/seasons';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		id: req.params.id,
		language: req.language,
		user_id: req.user.sub,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);
}

export const exec = ({ id, user_id, language }: { id: string; user_id: string; language: string }) => {
	return new Promise((resolve, reject) => {

		const tv = getTvPlayback({
			id: parseInt(id, 10),
			user_id,
			language,
		});

		if (!tv) {
			return reject({
				error: {
					code: 404,
					message: 'Tv show not found',
				},
				success: false,
			});
		}

		return resolve(getContent(tv, language));

	});
};

const getContent = (data: TvPlaybackWithRelations, language: string) => {
	if (!data) return;

	const files: any[] = [];
	for (const season of data.seasons) {
		for (const episode of season.episodes) {
			const item = playlist(episode, language);
			files.push(item);
		}
	};

	const response = [
		...files.filter(f => f?.season != 0),
		...files.filter(f => f?.season == 0),
	].filter(Boolean);

	return response;
};

type EpisodeItem = (Episode & {
	tv: (Tv & {
		images: Image;
		translations: Translation[];
		certification_tv: (CertificationTv & {
			certification: Certification;
		})[];
	});
	season: Season;
	translations: Translation[];
	videoFiles: (VideoFile & {
		userData: UserData[];
	})[];
});

const playlist = (episode: EpisodeItem, language: string): PlaylistItem | undefined => {

	if (!episode || !episode?.videoFiles?.[0]) return;

	let search = false;

	const videoFile = episode.videoFiles[0];

	const showTitle = episode.tv.translations[0]?.title;

	const overview = episode.translations[0]?.overview != '' && episode.translations[0]?.overview != null
		? episode.translations[0]?.overview
		: episode.overview;

	const title = episode.translations[0]?.title != '' && episode.translations[0]?.title != null
		? episode.translations[0]?.title
		: episode.title;

	const show = showTitle != '' && showTitle != null
		? showTitle
		: episode.tv.title;

	const textTracks: any[] = [];

	const baseFolder = `/${videoFile?.share}${videoFile?.folder}`;

	JSON.parse(videoFile?.subtitles ?? '[]')
		.forEach((sub) => {
			const { language, type, ext } = sub;

			if (language) {
				if (ext == 'ass') {
					search = true;
				}
				textTracks.push({
					label: type,
					type: type,
					src: `${baseFolder}/subtitles${videoFile?.filename.replace(/\.mp4|\.m3u8/u, '')}.${language}.${type}.${ext}`,
					srclang: i18next.t(`languages:${language}`),
					ext: ext,
					language: language,
					kind: 'subtitles',
				});
			}
		}) ?? [];

	let fonts: PlaylistItem['fonts'] = [];
	let fontsFile: PlaylistItem['fontsFile'] = '';
	if (search && existsSync(`${videoFile?.hostFolder}/fonts.json`)) {
		fontsFile = `/${videoFile?.share}/${videoFile?.folder}/fonts.json`;
		fonts = JSON.parse(readFileSync(`${videoFile?.hostFolder}/fonts.json`, 'utf8'));
	}

	let progress: { percentage: number; date: string; } | null = null;

	if (videoFile.userData?.[0]?.time) {
		progress = {
			// @ts-ignore
			percentage: (videoFile.userData?.[0].time / convertToSeconds(videoFile?.duration)) * 100,
			// @ts-ignore
			date: videoFile.userData?.[0].updated_at,
		};
	}

	const logo = episode.tv.images.find(m => m.type == 'logo')?.filePath ?? null;

	return {
		// @ts-ignore
		id: episode.id,
		// @ts-ignore
		title: title,
		// @ts-ignore
		description: overview,
		duration: videoFile?.duration,

		// poster: episode.still ?? episode.tv.backdrop ?? episode.tv.poster
		// 	? '/images/w300' + (episode.still ?? episode.tv.backdrop ?? episode.tv.poster)?.replace(/\.(jpg|png)$/u, '.webp')
		// 	: null,
		// image: episode.still ?? episode.tv.backdrop ?? episode.tv.poster
		// 	? '/images/w300' + (episode.still ?? episode.tv.backdrop ?? episode.tv.poster)?.replace(/\.(jpg|png)$/u, '.webp')
		// 	: null,
		// logo: logo
		// 	? '/images/original' + (logo)?.replace(/\.(jpg|png)$/u, '.webp')
		// 	: null,
		poster: episode.still ?? episode.tv.backdrop ?? episode.tv.poster
			? `https://image.tmdb.org/t/p/w300${episode.still ?? episode.tv.backdrop ?? episode.tv.poster}`
			: null,
		image: episode.still ?? episode.tv.backdrop ?? episode.tv.poster
			? `https://image.tmdb.org/t/p/w300${episode.still ?? episode.tv.backdrop ?? episode.tv.poster}`
			: null,
		logo: logo
			? `https://image.tmdb.org/t/p/original${logo}`
			: null,

		video_type: 'tv',
		season: episode.seasonNumber,
		episode: episode.episodeNumber,
		episode_id: episode.id,
		origin: deviceId,
		// @ts-ignore
		uuid: episode.tv.id + (episode.id ?? null),
		video_id: videoFile?.id ?? null,
		// @ts-ignore
		tmdbid: episode.tv.id,
		show: show,
		seasonName: episode.season?.title,
		playlist_type: 'tv',
		year: parseYear(episode?.tv?.firstAirDate ?? ''),
		// @ts-ignore
		rating: getClosestRating(episode.tv.certification_tv, language)?.certification,

		progress: progress,

		sources: [
			{
				src: `${baseFolder}${videoFile?.filename}`,
				type: videoFile?.filename.includes('.mp4')
					? 'video/mp4'
					: 'application/x-mpegURL',
				languages: JSON.parse(videoFile?.languages ?? '[]'),
			},
		],

		fonts,
		fontsFile,
		textTracks: sortBy(textTracks, 'language'),
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
				file: `${baseFolder}/skippers.vtt`,
				kind: 'skippers',
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
		production: episode.tv.status != 'Ended' && episode.tv.status != 'Released',
	};

};

