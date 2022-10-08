import { isOwner } from '../../middlewares/permissions';
import { Request, Response } from 'express';
import { deviceId } from '../../../functions/system';
import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { Prisma } from '@prisma/client'
import requestCountry from 'request-country';
import i18next from 'i18next';
import { existsSync, readFileSync } from 'fs';
import { convertToSeconds } from '../../../functions/dateTime';
import { sortBy } from '../../../functions/stringArray';

export default async function (req: Request, res: Response) {
	const language = req.acceptsLanguages()[0] != 'undefined' ? req.acceptsLanguages()[0].split('-')[0] : 'en';
	const id = req.params.id;
	const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);
	const country = requestCountry(req, 'US');

	return confDb.movie.findFirst(movieQuery({ id, language, country }))
		.then(async (movie) => {
			if (!movie?.VideoFile) { return; }

            const translation: any[] = [];
            const media: any[] = [];
            const progress: any[] = [];
            const files: any[] = [];
        
            await Promise.all([
                confDb.media.findMany(mediaQuery(id)).then((data: any[]) => media.push(...data)),
                confDb.translation.findMany(translationQuery({ id, language })).then((data: any[]) => translation.push(...data)),
                confDb.userData.findMany(progressQuery({ id, user_id: user })).then((data: any[]) => progress.push(...data)),
            ]);

			const textTracks: any[] = [];
			let search = false;

            const baseFolder = `/${movie.VideoFile[0]?.share}${movie.VideoFile[0]?.folder}`;

            JSON.parse(movie.VideoFile[0].subtitles ?? '[]')
                .forEach((sub) => {
                    const {language, type, ext} = sub;
                    
                    if (language) {
                        if (ext == 'ass') {
                            search = true;
                        }
                        textTracks.push({
                            label: type,
                            type: type,
                            src: `${baseFolder}/subtitles${movie.VideoFile[0].filename.replace(/\.mp4|\.m3u8/u, '')}.${language}.${type}.${ext}`,
                            srclang: i18next.t(`languages:${language}`),
                            ext: ext,
                            language: language,
                            kind: 'subtitles',
                        });
                    }
                }) ?? [];

			let fonts: any[] = [];
			let fontsfile = '';
			if (search && existsSync(`${movie.VideoFile[0]?.hostFolder}fonts.json`)) {
				fontsfile = `/${movie.VideoFile[0]?.share}/${movie.VideoFile[0]?.folder}fonts.json`;
				fonts = JSON.parse(readFileSync(`${movie.VideoFile[0]?.hostFolder}fonts.json`, 'utf8'));
			}

			const movieTranslations = translation
				.find((t) => t.translationableType == 'movie');

			const overview = movieTranslations?.overview != '' && movieTranslations?.overview != null 
				? movieTranslations?.overview 
				: movie.overview;
				
			const title = movieTranslations?.title != '' && movieTranslations?.title != null 
				? movieTranslations?.title 
				: movie.title;
			
			const showTitle = translation.find((t) => t.translationableType == 'movie')?.title;
			const show = showTitle != '' && showTitle != null ? showTitle : movie.title;
            
			const data: any = {
				id,
				title: title,
				description: overview,
				show: show,
				origin: deviceId,
				uuid: movie.id,
				video_id: movie.VideoFile[0]?.id,
				duration: movie.VideoFile[0].duration,
				tmdbid: movie.id,
				video_type: 'movie',
				playlist_type: 'movie',
				playlist_id: id,
				year: movie.releaseDate?.split('-')[0] ?? null,
				logo: media[0]?.src ?? null,
				rating: movie.Certification?.map((cr) => {
					return {
						country: cr.iso31661,
						rating: cr.Certification.rating,
						meaning: cr.Certification.meaning,
						image: `/${cr.iso31661}/${cr.iso31661}_${cr.Certification.rating}.svg`,
					};
				})?.[0] ?? {},

				progress: (progress[0]?.time / convertToSeconds(movie.VideoFile[0].duration) * 100) ?? null,

				poster: movie.poster ? movie.poster : null,
				backdrop: movie.backdrop ? movie.backdrop : null,
				image: movie.poster ?? movie.backdrop ? movie.poster ?? movie.backdrop : null,
				sources: [
					{
						src: `${baseFolder}${movie.VideoFile[0]?.filename}`,
						type: movie.VideoFile[0]?.filename.includes('.mp4') ? 'video/mp4' : 'application/x-mpegURL',
						languages: JSON.parse(movie.VideoFile[0]?.languages ?? '[]'),
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
			};

            return res.json([data]);
        });
}

interface movieQueryInterface {
	id: string;
	language: string;
	country: string;
}

const movieQuery = ({ id, language, country }: movieQueryInterface) => {
	return Prisma.validator<Prisma.MovieFindFirstArgs>()({
        where: {
            id: parseInt(id, 10),
        },
        include: {
            Certification: {
                where: {
                    iso31661: {
                        in: [country, language.toUpperCase()],
                    },
                },
                include: {
                    Certification: true,
                },
            },
            VideoFile: true,
        },
    });
};

const translationQuery = ({ id, language }: { id: string; language: string }) => {
	return Prisma.validator<Prisma.TranslationFindFirstArgs>()({
		where: {
			translationableType: 'movie',
			iso6391: language,
			translationableId: parseInt(id, 10),
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
	return Prisma.validator<Prisma.MediaFindFirstArgs>()({
		where: {
			movieId: parseInt(id, 10),
			type: 'logo',
		},
		orderBy: {
			voteAverage: 'asc',
		},
	});
};

const progressQuery = ({ id, user_id }: { id: string; user_id: string }) => {
	return Prisma.validator<Prisma.UserDataFindFirstArgs>()({
		where: {
			sub_id: user_id,
			movieId: parseInt(id, 10),
		},
	});
};
