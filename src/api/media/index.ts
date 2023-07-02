import { Movie, Translation, Tv, VideoFile } from '../../database/config/client';
import { Request, Response } from 'express';

import { getLanguage } from '../middleware';
import { parseYear } from '@/functions/dateTime';
import { mediaDb } from '@/db/media';
import { asc, inArray } from 'drizzle-orm';
import { translations } from '@/db/media/schema/translations';
import { Media } from '@/db/media/actions/medias';
import { genres } from '@/db/media/schema/genres';
import { Episode } from '@/db/media/actions/episodes';
import { Genre } from '@/db/media/actions/genres';
import { Image } from '@/db/media/actions/images';
import { movies } from '@/db/media/schema/movies';
import { tvs } from '@/db/media/schema/tvs';
import { getAllowedLibraries } from '@/db/media/actions/libraries';
import { images } from '@/db/media/schema/images';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const allowedLibraries = getAllowedLibraries(req);

	type G = Genre & {
		genre_movie: {
			movie: Movie & {
				translations: Translation[];
				medias: Media[];
				images: Image[];
				videoFiles: VideoFile[];
			};
		}[];
		genre_tv: {
			tv: Tv & {
				translations: Translation[];
				medias: Media[];
				images: Image[];
				episodes: (Episode & {
					videoFiles: VideoFile[];
				})[];
			};
		}[];
	};

	try {

		const g: G[] = mediaDb.query.genres.findMany({
			limit: req.body.take,
			offset: req.body.page,
			orderBy: asc(genres.name),
			with: {
				genre_movie: {
					with: {
						movie: {
							with: {
								translations: {
									where: (table: typeof translations, { eq }) => (eq(table.iso6391, language)),
								},
								images: {
									// columns: {
									// 	filePath: true,
									// 	type: true,
									// },
									where: (table: typeof images, { eq }) => (eq(table.type, 'logo')),
								},
								videoFiles: {
									columns: {
										id: true,
									},
								},
							},
							where: (table: {videoFiles: VideoFile[]}, { sql, and }) => (and(
								sql`json_array_length(${table.videoFiles}) > 0`,
								inArray(movies.library_id, allowedLibraries)
							)),
						},
					},
				},
				genre_tv: {
					with: {
						tv: {
							where: inArray(tvs.library_id, allowedLibraries),
							with: {
								translations: {
									where: (table: typeof translations, { eq }) => (eq(table.iso6391, language)),
								},
								images: {
									// columns: {
									// 	filePath: true,
									// 	type: true,
									// },
									where: (table: typeof images, { eq }) => (eq(table.type, 'logo')),
								},
								episodes: {
									columns: {
										id: true,
									},
									with: {
										videoFiles: {
											columns: {
												id: true,
											},
										},
									},
									where: (table: {videoFiles: VideoFile[]}, { sql }) => (sql`json_array_length(${table.videoFiles}) > 0`),
								},
							},
						},
					},
				},
			},
		}) as unknown as G[];

		const data = g.map((genre) => {
			const items = [
				...genre.genre_movie.filter(m => m.movie?.videoFiles.length > 0).map(m => ({
					...m.movie,
					Translation: m.movie?.translations,
					images: m.movie?.images,
				})),
				...genre.genre_tv.filter(t => t.tv?.episodes?.some(e => e.videoFiles.length > 0)).map(t => ({
					...t.tv,
					Translation: t.tv?.translations,
					images: t.tv?.images,
					VideoFiles: t.tv?.episodes?.map(e => e.videoFiles).flat(),
				})),
			];

			return {
				id: genre.id,
				title: genre.name,
				moreLink: '',
				items: items.map((d) => {
					const type = (d as Tv).firstAirDate
						? 'tv'
						: 'movie';

					const logo = d.images?.find(m => m.type == 'logo');

					// const logo = mediaDb.query.images.findFirst({
					// 	where: and(
					// 		eq(images[`${type}_id`], d.id),
					// 		eq(images.type, 'logo')
					// 	),
					// });

					const palette = JSON.parse(d.colorPalette ?? '{}');

					const trans = d.Translation?.[0];

					return {
						// ...d,
						id: d.id,
						backdrop: d.backdrop,
						// @ts-ignore
						logo: logo?.filePath ?? logo?.src ?? undefined,
						overview: trans?.overview == ''
							? d.overview
							: trans?.overview,
						poster: d.poster,
						title: d.title,
						titleSort: d.titleSort,
						type: type,
						year: parseYear((d as Tv).firstAirDate ?? (d as Movie).releaseDate),
						mediaType: type,
						colorPalette: palette,
					};
				})
					.sort(() => Math.random() - 0.5)
					.slice(0, 35),
			};
		});

		const nextId = data.length < req.body.take
			? undefined
			: data.length + req.body.page;

		return res.json({
			nextId: nextId,
			data: data,
		});
	} catch (e) {
		console.log(e);
	}

}
