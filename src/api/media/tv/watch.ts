import { Request, Response } from 'express';

import { TvWithRelations, getTvPlayback } from '@/db/media/actions/tvs';
import i18next from 'i18next';
import { convertToSeconds, parseYear } from '@/functions/dateTime';
import { getClosestRating, sortBy } from '@/functions/stringArray';
import { existsSync, readFileSync } from 'fs';
import { AppState, useSelector } from '@/state/redux';
import { deviceId } from '@/functions/system';

export default function (req: Request, res: Response) {

	const access_token = useSelector((state: AppState) => state.user.access_token);

	const tv = getTvPlayback({ id: parseInt(req.params.id, 10) }, true);
	if (!tv) {
		return res.status(404).json({
			success: false,
			error: 'Tv show not found',
		});
	}
	return res.json(getContent(tv, access_token));
};

const getContent = (data: TvWithRelations, access_token: string) => {
	const files: any[] = [];
	for (const season of data.seasons.sort((a, b) => a.seasonNumber - b.seasonNumber)) {
		for (const episode of season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)) {
			const item = playlist(episode, access_token);
			files.push(item);
		}
	};

	const response = [
		...files.filter(f => f?.season != 0),
		...files.filter(f => f?.season == 0),
	].filter(Boolean);

	return response;
};

const playlist = (episode: TvWithRelations['seasons'][0]['episodes'][0], access_token: string) => {

	if (!episode?.videoFiles) { return; }

	let search = false;
	const videoFile = episode.videoFiles?.[0];

	const showTitle = episode.tv.translation?.title;

	const overview = episode.translation?.overview != '' && episode.translation?.overview != null
		? episode.translation?.overview
		: episode.overview;

	const title = episode.translation?.title != '' && episode.translation?.title != null
		? episode.translation?.title
		: episode.title;

	const show = showTitle != '' && showTitle != null
		? showTitle
		: episode.tv.title;

	const textTracks: any[] = [];

	const baseFolder = `/${episode.videoFiles[0]?.share}${episode.videoFiles[0]?.folder}`;

	JSON.parse(episode.videoFiles[0]?.subtitles ?? '[]')
		.forEach((sub) => {
			const { language, type, ext } = sub;

			if (language) {
				if (ext == 'ass') {
					search = true;
				}
				textTracks.push({
					label: type,
					type: type,
					src: `${baseFolder}/subtitles${episode.videoFiles[0]?.filename.replace(/\.mp4|\.m3u8/u, '')}.${language}.${type}.${ext}`,
					srclang: i18next.t(`languages:${language}`),
					ext: ext,
					language: language,
					kind: 'subtitles',
				});
			}
		}) ?? [];

	let fonts: any[] = [];
	let fontsfile = '';
	if (search && existsSync(`${episode.videoFiles[0]?.hostFolder}fonts.json`)) {
		fontsfile = `/${episode.videoFiles[0]?.share}/${episode.videoFiles[0]?.folder}fonts.json`;
		fonts = JSON.parse(readFileSync(`${episode.videoFiles[0]?.hostFolder}fonts.json`, 'utf8'));
	}

	return {
		id: episode.id,
		title: title,
		description: overview,
		duration: videoFile?.duration,
		specialId: undefined,
		poster: episode.tv.poster
			? episode.tv.poster
			: null,
		backdrop: episode.tv.backdrop
			? episode.tv.backdrop
			: null,

		image: episode.still ?? episode.tv.poster
			? episode.still ?? episode.tv.poster
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
		rating: getClosestRating(episode.tv.certification_tv),

		progress: episode.userData?.[0]?.time
			? (episode.userData?.[0].time / convertToSeconds(episode.videoFiles[0]?.duration) * 100)
			: null,

		sources: [
			{
				src: `${baseFolder}${episode.videoFiles[0]?.filename}${episode.videoFiles[0]?.filename.includes('.mp4')
					? `?token=${access_token}`
					: ''}`,
				type: episode.videoFiles[0]?.filename.includes('.mp4')
					? 'video/mp4'
					: 'application/x-mpegURL',
				languages: JSON.parse(episode.videoFiles[0]?.languages ?? '[]'),
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

