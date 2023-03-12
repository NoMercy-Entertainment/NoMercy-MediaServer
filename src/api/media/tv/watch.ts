import { Media, Prisma } from '../../../database/config/client';
import { Request, Response } from 'express';
import { existsSync, readFileSync } from 'fs';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { convertToSeconds } from '../../../functions/dateTime';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';
import i18next from 'i18next';
import requestCountry from 'request-country';
import { sortBy } from '../../../functions/stringArray';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);
	console.log(language);

	const id = req.params.id;
	// const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	// const owner = isOwner(req as KAuthRequest);
	const country = requestCountry(req, 'US');

	const external: any[] = [];
	let length = 0;

	const translation: any[] = [];
	const media: Media[] = [];
	const progress: any[] = [];
	const files: any[] = [];

	confDb.tv.findFirst(tvQuery({ id, language, country })).then(async (tv) => {
		if (
			!tv
			|| !tv.Season
			|| (tv?.Season?.map(s => s.Episode?.flat())
				.flat()
				.flat().length == 0
				&& external?.[0])
		) {
			if (external.length > 0) {
				return external;
			}
			return [];
		}

		const seasonIds = tv.Season.map((s: { id: any }) => s.id);
		const episodeIds = tv.Season.map(s => s.Episode.map(ep => ep.id)).flat();

		await Promise.all([
			confDb.media.findMany(mediaQuery(id)).then(data => media.push(...data)),

			confDb.translation
				.findMany(
					translationQuery({
						id,
						seasonIds,
						episodeIds,
						language,
					})
				)
				.then((data: any[]) => translation.push(...data)),

			confDb.userData.findMany(progressQuery({ id, user_id: user })).then((data: any[]) => progress.push(...data)),
		]);

		tv.Season.map((season) => {
			let navigationY = 0;
			const seasonTranslations = translation.find(t => t.translationableType == 'season' && t.translationableId == season.id);

			season?.Episode.map((episode) => {
				// console.log(episode)
				const externalFile = external?.find(external => external.id == episode.id && external.duration != null);

				const videoFile = episode.VideoFile?.[0] ?? externalFile;

				if (videoFile) {
					length += convertToSeconds(videoFile?.duration);
				}

				if (!episode.VideoFile[0] && externalFile) {
					files.push(externalFile);
					return;
				}

				if (!videoFile) return;

				const episodeTranslations = translation
					.find(t => t.translationableType == 'episode' && t.translationableId == episode.id);

				const overview = episodeTranslations?.overview != '' && episodeTranslations?.overview != null
					? episodeTranslations?.overview
					: episode.overview;

				const title = episodeTranslations?.title != '' && episodeTranslations?.title != null
					? episodeTranslations?.title
					: episode.title;

				const showTitle = translation.find(t => t.translationableType == 'tv')?.title;
				const show = showTitle != '' && showTitle != null
					? showTitle
					: tv.title;

				const textTracks: any[] = [];
				let search = false;

				const baseFolder = `/${videoFile?.share}${videoFile?.folder}`;

				JSON.parse(videoFile?.subtitles ?? '[]').forEach((sub) => {
					const { language, type, ext } = sub;

					if (language) {
						if (ext == 'ass') {
							search = true;
						}
						textTracks.push({
							label: type,
							// type: type,
							src: `${baseFolder}/subtitles${videoFile?.filename.replace(/\.mp4|\.m3u8/u, '')}.${language}.${type}.${ext}`,
							srclang: i18next.t(`languages:${language}`),
							// ext: ext,
							language: language,
							kind: 'subtitles',
						});
					}
				});

				let fonts: any[] = [];
				let fontsFile = '';
				if (search && existsSync(`${videoFile?.hostFolder}/fonts.json`)) {
					fontsFile = `${baseFolder}/fonts.json`;
					fonts = JSON.parse(readFileSync(`${videoFile?.hostFolder}/fonts.json`, 'utf8')).map((f: { file: string; mimeType: string }) => {
						return {
							...f,
							file: `${baseFolder}/fonts/${f.file}`,
						};
					});
				}

				const data: any = {
					id: episode.id,
					title: title,
					description: overview,
					duration: videoFile?.duration,

					poster: tv.poster
						? tv.poster
						: null,
					backdrop: tv.backdrop
						? tv.backdrop
						: null,

					image: episode.still ?? tv.poster
						? episode.still ?? tv.poster
						: null,

					year: tv.firstAirDate?.split('-')[0] ?? null,
					season_image: season.poster
						? season.poster
						: null,
					video_type: 'tv',
					production: tv.status != 'Ended',
					season: episode.seasonNumber,
					episode: episode.episodeNumber,
					navigationY,
					// season_title: episode.seasonNumber == 0
					// 	? tv.Library.specialSeasonName
					// 	: seasonTranslations?.title ?? season.title,
					// season_overview: seasonTranslations?.overview ?? season.overview,
					// season_id: season.id,
					episode_id: episode.id,
					origin: deviceId,
					uuid: id + episode.id,
					video_id: videoFile?.id,
					tmdbid: id,
					show: show,
					playlist_type: 'tv',
					playlist_id: id,
					logo: media[0]?.src ?? null,
					rating:
						tv.Certification.map((cr) => {
							return {
								country: cr.iso31661,
								rating: cr.Certification.rating,
								meaning: cr.Certification.meaning,
								image: `/${cr.iso31661}/${cr.iso31661}_${cr.Certification.rating}.svg`,
							};
						})?.[0] ?? {},

					progress: progress.some(p => p.videoFileId == videoFile?.id)
						? (progress.find(p => p.videoFileId == videoFile?.id).time / convertToSeconds(videoFile?.duration)) * 100
						: null,

					textTracks: sortBy(textTracks, 'language'),
					fonts,
					fontsFile,
					sources: [
						{
							src: `${baseFolder}${videoFile?.filename}`,
							// src: '/cl7i4km1o0008qwef7qwdapxe/2.Broke.Girls.(2011)/2.Broke.Girls.S01E01/2.Broke.Girls.S01E01.Pilot.m3u8',
							type: videoFile?.filename.includes('.mp4')
								? 'video/mp4'
								: 'application/x-mpegURL',
							languages: JSON.parse(videoFile?.languages ?? '[]'),
						},
					].filter(s => !s.src.includes('undefined')),

					tracks: [
						{
							file: `${baseFolder}/previews.vtt`,
							// file: '/cl7i4km1o0008qwef7qwdapxe/2.Broke.Girls.(2011)/2.Broke.Girls.S01E01/previews.vtt',
							kind: 'thumbnails',
						},
						{
							file: `${baseFolder}/chapters.vtt`,
							// file: '/cl7i4km1o0008qwef7qwdapxe/2.Broke.Girls.(2011)/2.Broke.Girls.S01E01/chapters.vtt',
							kind: 'chapters',
						},
						{
							file: `${baseFolder}/sprite.webp`,
							// file: '/cl7i4km1o0008qwef7qwdapxe/2.Broke.Girls.(2011)/2.Broke.Girls.S01E01/sprite.webp',
							kind: 'sprite',
						},
						{
							file: `${baseFolder}/fonts.json`,
							// file: '/cl7i4km1o0008qwef7qwdapxe/2.Broke.Girls.(2011)/2.Broke.Girls.S01E01/fonts.json',
							kind: 'fonts',
						},
					].filter(t => !t.file.includes('undefined')),
				};

				files.push(data);
				navigationY += 1;
			});
		});

		// console.log(convertToHuman(length));

		return res.json(files.filter(f => f.season != 0).concat(...files.filter(f => f.season == 0)));
	});
}

interface TVQueryInterface {
	id: string;
	language: string;
	country: string;
}

const tvQuery = ({ id, language, country }: TVQueryInterface) => {
	return Prisma.validator<Prisma.TvFindFirstArgs>()({
		where: {
			id: parseInt(id, 10),
		},
		include: {
			Library: true,
			Certification: {
				where: {
					iso31661: {
						in: [language.toUpperCase(), country],
					},
				},
				include: {
					Certification: true,
				},
			},
			Season: {
				orderBy: {
					seasonNumber: 'asc',
				},
				include: {
					Episode: {
						orderBy: {
							episodeNumber: 'asc',
						},
						include: {
							VideoFile: true,
						},
					},
				},
			},
		},
	});
};

interface TranslationQueryInterface {
	id: string;
	seasonIds: number[];
	episodeIds: number[];
	language: string;
}
const translationQuery = ({ id, seasonIds, episodeIds, language }: TranslationQueryInterface) => {
	return Prisma.validator<Prisma.TranslationFindManyArgs>()({
		where: {
			OR: [
				{
					translationableType: 'tv',
					iso6391: language,
					translationableId: parseInt(id, 10),
				},
				{
					translationableType: 'season',
					iso6391: language,
					translationableId: {
						in: seasonIds,
					},
				},
				{
					translationableType: 'episode',
					iso6391: language,
					translationableId: {
						in: episodeIds,
					},
				},
			],
		},
		select: {
			title: true,
			overview: true,
			iso6391: true,
			translationableType: true,
			translationableId: true,
		},
	});
};

const mediaQuery = (id: string) => {
	return Prisma.validator<Prisma.MediaFindManyArgs>()({
		where: {
			tvId: parseInt(id, 10),
			type: 'logo',
		},
		orderBy: {
			voteAverage: 'asc',
		},
	});
};

const progressQuery = ({ id, user_id }: { id: string; user_id: string }) => {
	return Prisma.validator<Prisma.UserDataFindManyArgs>()({
		where: {
			sub_id: user_id,
			tvId: parseInt(id, 10),
		},
	});
};
