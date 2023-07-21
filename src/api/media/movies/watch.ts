import { Request, Response } from 'express';
import { existsSync, readFileSync } from 'fs';

import { convertToSeconds, parseYear } from '@server/functions/dateTime';
import { deviceId } from '@server/functions/system';
import i18next from 'i18next';
import { getClosestRating, sortBy } from '@server/functions/stringArray';
import { MoviePlaybackWithRelations, getMoviePlayback } from '@server/db/media/actions/movies';
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

		const movie = getMoviePlayback({ id: parseInt(id, 10), user_id, language });

		if (!movie) {
			return reject({
				error: {
					code: 404,
					message: 'Movie not found',
				},
				success: false,
			});
		}

		return resolve(getContent(movie, user_id, language));
	});
};

const getContent = (movie: MoviePlaybackWithRelations, user_id: string, language: string) => {

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

	let fonts: any[] = [];
	let fontsfile = '';
	if (search && existsSync(`${videoFile?.hostFolder}fonts.json`)) {
		fontsfile = `/${videoFile?.share}/${videoFile?.folder}fonts.json`;
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

	return [
		{
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
			playlist_id: movie.id,
			year: parseYear(movie.releaseDate),
			logo: movie.medias[0]?.src ?? null,
			rating: getClosestRating(movie.certification_movie, language),

			progress: videoFile.userData?.[0]?.time
				? (videoFile.userData?.[0].time / convertToSeconds(videoFile.duration) * 100)
				: null,

			poster: movie.poster
				? movie.poster
				: null,
			backdrop: movie.backdrop
				? movie.backdrop
				: null,
			image: movie.poster ?? movie.backdrop
				? movie.poster ?? movie.backdrop
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
			production: movie.status != 'Ended' && movie.status != 'Released',
		},
	];

};
