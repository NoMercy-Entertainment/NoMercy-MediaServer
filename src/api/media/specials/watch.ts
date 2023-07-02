import { Request, Response } from 'express';

// import data from './data';
// import { isOwner } from '@/api/middleware/permissions';
import { PlaylistItem } from '@/types/video';
import { convertToSeconds } from '@/functions/dateTime';
import i18next from 'i18next';
import { getClosestRating, sortBy } from '@/functions/stringArray';
import { deviceId } from '@/functions/system';
import { AppState, useSelector } from '@/state/redux';
import { SpecialWithRelations, getSpecial } from '@/db/media/actions/specials';

export default async function (req: Request, res: Response) {

	const items = getSpecial({ id: req.params.id }, true);

	if (!items) {
		return res.status(404).json({
			error: 'not_found',
			error_description: 'Special not found',
		});
	}

	const files: any[] = [];

	for (const [key, item] of items.specialItems.entries()) {
		const d = await data({ index: key, data: item.episode ?? item.movie!, id: req.params.id });
		files.push(d);
	};

	return res.json(files);
}

type MovieData = SpecialWithRelations['specialItems'][0]['movie'];
type TVData = SpecialWithRelations['specialItems'][0]['episode'];

const data = ({ index, data, id }: { index: number; data: TVData | MovieData; id: string }): PlaylistItem => {
	data = data!;

	const access_token = useSelector((state: AppState) => state.user.access_token);

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

	const item: PlaylistItem = {
		id: data.id,
		title: title,
		description: overview,
		duration: videoFile?.duration ?? null,
		special_id: id,

		poster: ((data as TVData)?.tv?.poster
			? (data as TVData)?.tv?.poster
			: (data as MovieData)?.poster) ?? null,
		backdrop: ((data as TVData)?.tv?.backdrop
			? (data as TVData)?.tv?.backdrop
			: (data as MovieData)?.backdrop) ?? null,

		image: ((data as TVData)?.still
			? (data as TVData)?.still
			: (data as MovieData)?.poster) ?? null,

		logo: logo,

		year: (data as TVData)?.tv?.firstAirDate?.split('-')[0] ?? '',
		video_type: (data as TVData)?.tv?.firstAirDate
			? 'tv'
			: 'movie',
		production: (data as TVData)?.tv?.status != 'Ended',
		season: 1,
		episode: index,
		episode_id: data.id,
		origin: deviceId,
		uuid: parseInt(`${(data as TVData)?.tv?.id ?? ''}${data.id}`, 10),
		video_id: videoFile?.id as string,
		tmdbid: (data as TVData)?.tv?.id ?? (data as MovieData)!.id!,
		show: show,
		playlist_type: 'special',
		rating: getClosestRating(data.certifications ?? []),
		progress: videoFile && videoFile?.userData?.[0]?.time
			? (videoFile.userData[0].time / convertToSeconds(videoFile.duration)) * 100
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

	return item;

};
