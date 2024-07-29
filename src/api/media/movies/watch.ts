import { Request, Response } from 'express-serve-static-core';
import { existsSync, readFileSync } from 'fs';

import { convertToSeconds, parseYear } from '@server/functions/dateTime';
import { deviceId } from '@server/functions/system';
import i18next from 'i18next';
import { getClosestRating, sortBy } from '@server/functions/stringArray';
import { MoviePlaybackWithRelations, getMoviePlayback } from '@server/db/media/actions/movies';
import { requestWorker } from '@server/api/requestWorker';
import { PlaylistItem } from '@server/types/video';

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

		const movie = getMoviePlayback({
			id: parseInt(id, 10),
			user_id,
			language,
		});

		if (!movie) {
			return reject({
				error: {
					code: 404,
					message: 'Movie not found',
				},
				success: false,
			});
		}

		return resolve([getContent(movie, language)]);
	});
};

const getContent = (movie: MoviePlaybackWithRelations, language: string): PlaylistItem | undefined => {

	if (!movie?.videoFiles) { return; }

	const videoFile = movie.videoFiles[0];

	const textTracks: any[] = [];
	let search = false;

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
	if (search && existsSync(`${videoFile?.hostFolder}fonts.json`)) {
		fontsFile = `/${videoFile?.share}/${videoFile?.folder}fonts.json`;
		fonts = JSON.parse(readFileSync(`${videoFile?.hostFolder}fonts.json`, 'utf8'));
	}

	const overview = movie.translations[0]?.overview != '' && movie.translations[0]?.overview != null
		? movie.translations[0]?.overview
		: movie.overview;

	const title = movie.translations[0]?.title != '' && movie.translations[0]?.title != null
		? movie.translations[0]?.title
		: movie.title;

	const showTitle = title;
	const show = showTitle != '' && showTitle != null
		? showTitle
		: movie.title;

	let progress: { percentage: number; date: string; } | null = null;

	if (videoFile.userData?.[0]?.time) {
		progress = {
			percentage: (videoFile.userData?.[0].time / convertToSeconds(videoFile?.duration)) * 100,
			date: videoFile.userData?.[0].updated_at,
		};
	}

	const logo = movie.images?.[0]?.filePath ?? null;

	return {
		id: movie.id,
		title: title,
		description: overview,
		show: show,
		origin: deviceId,
		uuid: movie.id,
		video_id: videoFile.id,
		duration: videoFile.duration,
		tmdbid: movie.id,
		video_type: 'movie',
		playlist_type: 'movie',
		year: parseYear(movie.releaseDate),
		rating: getClosestRating(movie.certification_movie, language)?.certification,

		progress: progress,

		// poster: movie.backdrop ?? movie.poster
		// 	? `/images/w300${(movie.backdrop ?? movie.poster)?.replace(/\.(jpg|png)$/u, '.webp')}`
		// 	: null,
		// image: movie.backdrop ?? movie.poster
		// 	? `/images/w300${(movie.backdrop ?? movie.poster)?.replace(/\.(jpg|png)$/u, '.webp')}`
		// 	: null,
		// logo: logo
		// 	? `/images/original${logo?.replace(/\.(jpg|png)$/u, '.webp')}`
		// 	: null,
		poster: movie.backdrop ?? movie.poster
			? `https://image.tmdb.org/t/p/w300${movie.backdrop ?? movie.poster}`
			: null,
		image: movie.backdrop ?? movie.poster
			? `https://image.tmdb.org/t/p/w300${movie.backdrop ?? movie.poster}`
			: null,
		logo: logo
			? `https://image.tmdb.org/t/p/original${logo}`
			: null,


		sources: [
			{
				src: `${baseFolder}${videoFile.filename}`,
				type: videoFile.filename.includes('.mp4')
					? 'video/mp4'
					: 'application/x-mpegURL',
				languages: JSON.parse(videoFile.languages ?? '[]'),
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
	};

};
