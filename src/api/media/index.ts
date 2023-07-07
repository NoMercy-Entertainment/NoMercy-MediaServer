import { Movie, Translation, Tv, VideoFile } from '../../database/config/client';
import { Request, Response } from 'express';

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
import { GenreMovie } from '@/db/media/actions/genre_movie';
import { GenreTv } from '@/db/media/actions/genre_tv';

export default function (req: Request, res: Response) {
	const allowedLibraries = getAllowedLibraries(req);

	if (!allowedLibraries || allowedLibraries.length == 0) {
		return res.status(404).json({
			status: 'error',
			message: 'No libraries found',
		});
	}

	type G = (Genre & {
		genre_movie: (GenreMovie &{
			movie: (Movie & {
				translations: Translation[];
				medias: Media[];
				images: Image[];
				videoFiles: VideoFile[];
			});
		})[];
		genre_tv: (GenreTv & {
			tv: (Tv & {
				translations: Translation[];
				medias: Media[];
				images: Image[];
				episodes: (Episode & {
					videoFiles: VideoFile[];
				})[];
			});
		})[];
	});

	try {

		const genresResponse = mediaDb.query.genres.findMany({
			limit: req.body.take,
			offset: req.body.page,
			orderBy: asc(genres.name),
			with: {
				genre_movie: true,
				genre_tv: true,
			},
		}) as unknown as (Genre & {
			genre_movie: GenreMovie[];
			genre_tv: GenreTv[];
		})[];

		const movieGids = genresResponse.map(g => g.genre_movie.map(m => m.movie_id)).flat();
		const moviesResponse = movieGids.length == 0
			? []
			: mediaDb.query.movies.findMany({
				where: (table: {videoFiles: VideoFile[]}, { sql, and }) => (and(
					sql`json_array_length(${table.videoFiles}) > 0`,
					inArray(movies.id, movieGids)
				)),
				with: {
					translations: {
						where: (table: typeof translations, { eq }) => (eq(table.iso6391, req.language)),
					},
					images: {
						columns: {
							filePath: true,
							type: true,
						},
						where: (table: typeof images, { eq }) => (eq(table.type, 'logo')),
					},
					videoFiles: {
						columns: {
							id: true,
						},
					},
				},
			}) as unknown as (Movie & {
				translations: Translation[];
				medias: Media[];
				images: Image[];
				videoFiles: VideoFile[];
			})[];

		const tvGids = genresResponse.map(g => g.genre_tv.map(t => t.tv_id)).flat();
		const tvsResponse = tvGids.length == 0
			? []
			: mediaDb.query.tvs.findMany({
				where: inArray(tvs.id, tvGids),
				with: {
					translations: {
						where: (table: typeof translations, { eq }) => (eq(table.iso6391, req.language)),
					},
					images: {
						columns: {
							filePath: true,
							type: true,
						},
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
			}) as unknown as (Tv & {
				translations: Translation[];
				medias: Media[];
				images: Image[];
				episodes: (Episode & {
					videoFiles: VideoFile[];
				})[];
			})[];

		const g: G[] = genresResponse.map(genre => ({
			...genre,
			genre_movie: genre.genre_movie.map(m => ({
				...m,
				movie: moviesResponse.find(mr => mr.id == m.movie_id)! ?? [],
			})),
			genre_tv: genre.genre_tv.map(t => ({
				...t,
				tv: tvsResponse.find(tr => tr.id == t.tv_id)! ?? [],
			})),
		}));

		const data = g.map((genre) => {
			const items = [
				...genre.genre_movie.filter(m => m.movie?.videoFiles?.length > 0).map(m => ({
					...m.movie,
					translations: m.movie?.translations,
					images: m.movie?.images,
				})),
				...genre.genre_tv.filter(t => t.tv?.episodes?.some(e => e.videoFiles?.length > 0)).map(t => ({
					...t.tv,
					translations: t.tv?.translations,
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

					const palette = JSON.parse(d.colorPalette ?? '{}');

					const trans = d.translations?.[0];

					return {
						id: d.id,
						backdrop: d.backdrop,
						// @ts-ignore
						logo: logo?.filePath ?? logo?.src ?? undefined,
						overview: !trans?.overview || trans?.overview == ''
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
