import { Request, Response } from 'express-serve-static-core';

// import data from './data';
// import { isOwner } from '@server/api/middleware/permissions';
import { PlaylistItem } from '@server/types//video';
import { convertToSeconds, parseYear } from '@server/functions/dateTime';
import i18next from 'i18next';
import { getClosestRating, sortBy } from '@server/functions/stringArray';
import { deviceId } from '@server/functions/system';
import { getSpecial } from '@server/db/media/actions/specials';
import { Movie } from '@server/db/media/actions/movies';
import { Episode } from '@server/db/media/actions/episodes';
import { Tv } from '@server/db/media/actions/tvs';
import { VideoFile } from '@server/db/media/actions/videoFiles';
import { Translation } from '@server/db/media/actions/translations';
import { Media } from '@server/db/media/actions/medias';
import { UserData } from '@server/db/media/actions/userData';
import { Certification } from '@server/db/media/actions/certifications';

export default async function (req: Request, res: Response) {

	const items = getSpecial({ id: req.params.id, user_id: req.user.sub });

	if (!items) {
		return res.status(404).json({
			error: 'not_found',
			error_description: 'Special not found',
		});
	}

	const files: any[] = [];

	for (const [key, item] of items.specialItems.entries()) {
		// @ts-ignore
		const d = await data({ index: key, data: item.episode ?? item.movie!, id: req.params.id, language: req.language });
		files.push(d);
	};

	return res.json(files);
}

type MovieData = Movie & {
	videoFiles: (VideoFile & {
		userData: UserData[];
	})[];
	translation: Translation;
	medias: Media[];
	certifications: {
		certification: Certification;
	}[];
};
type TVData = Episode & {
	tv: Tv & {
		translation: Translation;
	};
	videoFiles: (VideoFile & {
		userData: UserData[];
	})[];
	translation: Translation;
	certifications: {
		certification: Certification;
	}[];
	medias: Media[];
};

const data = ({ index, data, id, language }: { index: number; data: TVData | MovieData; id: string; language: string }): PlaylistItem => {
	data = data!;

	const videoFile = data.videoFiles?.[0];

	const show = (data as TVData)!.tv?.translation?.title == ''
		? (data as TVData)!.tv?.title
		: (data as TVData)!.tv?.translation?.title;

	const overview = data.translation?.overview != '' && data.translation?.overview != null
		? data.translation?.overview
		: data.overview;

	const title = data.translation?.title != '' && data.translation?.title != null
		? data.translation?.title
		: data.title as string;

	const logo = data?.medias.find(m => m.type == 'logo')?.src ?? null;

	const textTracks: any[] = [];

	const baseFolder = `/${videoFile?.share}${videoFile?.folder}`;

	JSON.parse(videoFile?.subtitles ?? '[]').forEach((sub: { language: any; type: any; ext: any; }) => {
		const { language, type, ext } = sub;

		textTracks.push({
			label: type,
			src: `${baseFolder}/subtitles${videoFile?.filename.replace(/\.mp4|\.m3u8/u, '')}.${language}.${type}.${ext}`,
			srclang: i18next.t(`languages:${language}`),
			language: language,
			kind: 'subtitles',
		});
	});

	let progress: { percentage: number; date: string; } | null = null;

	if (videoFile?.userData?.[0]?.time) {
		progress = {
			percentage: (videoFile.userData?.[0].time / convertToSeconds(videoFile?.duration)) * 100,
			date: videoFile.userData?.[0].updated_at,
		};
	}

	const item: PlaylistItem = {
		id: data.id,
		title: (data as TVData).episodeNumber
			? `${show} %S${(data as TVData).seasonNumber}%E${(data as TVData).episodeNumber} - ${title}`
			: title,
		description: overview,
		duration: videoFile?.duration ?? null,
		special_id: id,

		// poster: ((data as TVData)?.tv?.poster
		// 	? (data as TVData)?.tv?.poster
		// 	: (data as MovieData)?.poster) ?? null,

		// image: ((data as TVData)?.still
		// 	? (data as TVData)?.still
		// 	: (data as MovieData)?.poster) ?? null,

		// logo: logo,

		poster: (data as MovieData).backdrop ?? (data as TVData)?.tv.backdrop ?? (data as TVData)?.tv.poster
			? `https://image.tmdb.org/t/p/w300${((data as MovieData).backdrop ?? (data as TVData)?.tv.backdrop ?? (data as TVData)?.tv.poster)}`
			: null,
		image: (data as TVData)?.still ?? (data as MovieData).backdrop ?? (data as TVData)?.still
			? `https://image.tmdb.org/t/p/w300${((data as TVData)?.still ?? (data as MovieData).backdrop ?? (data as TVData)?.still)}`
			: null,
		logo: logo
			? `https://image.tmdb.org/t/p/original${(logo)}`
			: null,

		year: parseYear((data as TVData)?.tv?.firstAirDate ?? (data as MovieData).releaseDate ?? ''),
		video_type: (data as TVData)?.tv?.firstAirDate
			? 'tv'
			: 'movie',
		production: (data as TVData)?.tv?.status != 'Ended',

		season: 0,
		episode: index + 1,

		episode_id: data.id,
		origin: deviceId,
		uuid: parseInt(`${(data as TVData)?.tv?.id ?? ''}${data.id}`, 10),
		video_id: videoFile?.id as string,
		tmdbid: (data as TVData)?.tv?.id ?? (data as MovieData)!.id!,
		show: show,
		playlist_type: 'special',
		rating: getClosestRating(data?.certifications ?? [], language)?.certification,

		progress: progress,

		textTracks: sortBy(textTracks, 'language'),
		sources: [
			{
				src: `${baseFolder}${videoFile?.filename}`,
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

	return item;

};
