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
import { Media } from '@server/db/media/actions/medias';
import { Certification } from '@server/db/media/actions/certifications';
import { requestWorker } from '@server/api/requestWorker';

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
	return new Promise(async (resolve, reject) => {

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

type PlaylistItem = (Episode & {
	tv: (Tv & {
		medias: Media[];
		translations: Translation[];
		certification_tv: (CertificationTv & {
			certification: Certification;
		})[];
	});
	translations: Translation[];
	videoFiles: (VideoFile & {
		userData: UserData[];
	})[];
});
const playlist = (episode: PlaylistItem, language: string) => {

	if (!episode?.videoFiles?.[0]) return;

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

	let fonts: any[] = [];
	let fontsfile = '';
	if (search && existsSync(`${videoFile?.hostFolder}fonts.json`)) {
		fontsfile = `/${videoFile?.share}/${videoFile?.folder}fonts.json`;
		fonts = JSON.parse(readFileSync(`${videoFile?.hostFolder}fonts.json`, 'utf8'));
	}

	return {
		id: episode.id,
		title: title,
		description: overview,
		duration: videoFile?.duration,
		specialId: undefined,
		
		poster: episode.still ?? episode.tv.backdrop ?? episode.tv.poster
			? '/images/original' + (episode.still ?? episode.tv.backdrop ?? episode.tv.poster)?.replace('.jpg', '.webp')
			: null,
		image: episode.still ?? episode.tv.backdrop ?? episode.tv.poster
			? '/images/original' + (episode.still ?? episode.tv.backdrop ?? episode.tv.poster)?.replace('.jpg', '.webp')
			: null,
			
		video_type: 'tv',
		season: episode.seasonNumber,
		episode: episode.episodeNumber,
		episode_id: episode.id,
		origin: deviceId,
		uuid: episode.id + episode.id,
		video_id: videoFile?.id,
		tmdbid: episode.tv.id,
		show: show,
		playlist_type: 'tv',
		year: episode.tv.firstAirDate
			? parseYear(episode.tv.firstAirDate)
			: null,
		logo: episode.tv.medias.find(m => m.type == 'logo')?.src ?? null,
		rating: getClosestRating(episode.tv.certification_tv, language),

		progress: videoFile.userData?.[0]?.time
			? (videoFile.userData?.[0].time / convertToSeconds(videoFile?.duration) * 100)
			: null,

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
		fontsfile,
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

