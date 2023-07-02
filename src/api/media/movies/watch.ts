import { Request, Response } from 'express';
import { existsSync, readFileSync } from 'fs';

import { convertToSeconds, parseYear } from '../../../functions/dateTime';
import { deviceId } from '../../../functions/system';
import i18next from 'i18next';
import { getClosestRating, sortBy } from '../../../functions/stringArray';
import { AppState, useSelector } from '@/state/redux';
import { MovieWithRelations, getMoviePlayback } from '@/db/media/actions/movies';

export default function (req: Request, res: Response) {

	const access_token = useSelector((state: AppState) => state.user.access_token);

	const movie = getMoviePlayback({ id: parseInt(req.params.id, 10) }, true);
	if (!movie) {
		return res.status(404).json({
			success: false,
			error: 'Movie not found',
		});
	}
	return res.json(getContent(movie, access_token));
}

const getContent = (movie: MovieWithRelations, access_token: string) => {

	if (!movie?.videoFiles) { return; }

	const textTracks: any[] = [];
	let search = false;

	const baseFolder = `/${movie.videoFiles[0]?.share}${movie.videoFiles[0]?.folder}`;

	JSON.parse(movie.videoFiles[0]?.subtitles ?? '[]')
		.forEach((sub) => {
			const { language, type, ext } = sub;

			if (language) {
				if (ext == 'ass') {
					search = true;
				}
				textTracks.push({
					label: type,
					type: type,
					src: `${baseFolder}/subtitles${movie.videoFiles[0]?.filename.replace(/\.mp4|\.m3u8/u, '')}.${language}.${type}.${ext}`,
					srclang: i18next.t(`languages:${language}`),
					ext: ext,
					language: language,
					kind: 'subtitles',
				});
			}
		}) ?? [];

	let fonts: any[] = [];
	let fontsfile = '';
	if (search && existsSync(`${movie.videoFiles[0]?.hostFolder}fonts.json`)) {
		fontsfile = `/${movie.videoFiles[0]?.share}/${movie.videoFiles[0]?.folder}fonts.json`;
		fonts = JSON.parse(readFileSync(`${movie.videoFiles[0]?.hostFolder}fonts.json`, 'utf8'));
	}

	const overview = movie.translation?.overview != '' && movie.translation?.overview != null
		? movie.translation?.overview
		: movie.overview;

	const title = movie.translation?.title != '' && movie.translation?.title != null
		? movie.translation?.title
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
			video_id: movie.videoFiles[0]?.id,
			duration: movie.videoFiles[0]?.duration,
			tmdbid: movie.id,
			video_type: 'movie',
			playlist_type: 'movie',
			playlist_id: movie.id,
			year: parseYear(movie.releaseDate),
			logo: movie.medias[0]?.src ?? null,
			rating: getClosestRating(movie.certification_movie),

			progress: movie.userData?.[0]?.time
				? (movie.userData?.[0].time / convertToSeconds(movie.videoFiles[0]?.duration) * 100)
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
					src: `${baseFolder}${movie.videoFiles[0]?.filename}${movie.videoFiles[0]?.filename.includes('.mp4')
						? `?token=${access_token}`
						: ''}`,
					type: movie.videoFiles[0]?.filename.includes('.mp4')
						? 'video/mp4'
						: 'application/x-mpegURL',
					languages: JSON.parse(movie.videoFiles[0]?.languages ?? '[]'),
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
