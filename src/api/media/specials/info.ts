import { Request, Response } from 'express-serve-static-core';

import { InfoResponse } from '@server/types//server';
import { createTitleSort } from '@server/tasks/files/filenameParser';
import { convertToSeconds, parseYear } from '@server/functions/dateTime';
import { getSpecial } from '@server/db/media/actions/specials';
import { unique } from '@server/functions/stringArray';

export default function (req: Request, res: Response) {

	const data = getSpecial({ id: req.params.id });

	if (!data) {
		return res.status(404).json({
			error: 'not_found',
			error_description: 'Special not found',
		});
	}
	

	const lowestYear = data.specialItems.reduce((a, b) => {
		return Math.min(a, parseYear(b?.episode?.tv?.firstAirDate as string) ?? parseYear(b?.movie?.releaseDate) ?? 0);
	}, 9999);

	const totalDuration = data.specialItems.reduce((a, b) => {
		return a + (convertToSeconds(
			b?.episode?.videoFiles?.[0]?.duration
			?? b?.movie?.videoFiles?.[0]?.duration
			?? '00:00:00'
		) / 60);
	}, 0);

	const averageRating = data.specialItems.reduce((a, b) => {
		return a + (b?.episode?.tv.voteAverage ?? b?.movie?.voteAverage ?? 0);
	}, 0) / data.specialItems.length;

	const response: InfoResponse = {
		id: data.id as string,
		title: data.title,
		overview: data.description,
		poster: data.poster,
		logo: data.logo,
		creator: {
			id: '6aa35c70-7136-44f3-baba-e1d464433426',
			name: data.creator as string,
		},
		backdrop: data.backdrop,
		videos: [],
		backdrops: [],
		logos: [],
		posters: [],
		contentRatings: [],
		watched: false,
		favorite: false,
		duration: totalDuration,
		year: lowestYear,
		type: 'special',
		mediaType: 'special',
		// cast: data.credits.cast.map((c) => {
		// 	return {
		// 		gender: c.person?.gender ?? null,
		// 		id: c.person?.id as number,
		// 		creditId: c.roles[0].credit_id,
		// 		character: c.roles[0].character,
		// 		knownForDepartment: c.person?.knownForDepartment ?? null,
		// 		name: c.person?.name ?? null,
		// 		profilePath: c.person?.profile ?? null,
		// 		popularity: c.person?.popularity ?? null,
		// 		deathday: c.person?.deathday ?? null,
		// 		// blurHash: c.blurHash,
		// 	};
		// }),
		// crew: data.credits.crew.map((c) => {
		// 	return {
		// 		gender: c.person?.gender ?? null,
		// 		id: c.person?.id as number,
		// 		creditId: c.jobs[0].credit_id,
		// 		job: c.jobs[0].job,
		// 		knownForDepartment: c.person?.knownForDepartment ?? null,
		// 		name: c.person?.name ?? null,
		// 		profilePath: c.person?.profile ?? null,
		// 		popularity: c.person?.popularity ?? null,
		// 		deathday: c.person?.deathday ?? null,
		// 		// blurHash: c.blurHash,
		// 	};
		// }),
		cast: [],
		crew: [],
		director: [],
		keywords: [],
		creators: [],
		directors: [],
		writers: [],
		titleSort: createTitleSort(data.title),
		voteAverage: averageRating,
		genres: unique(data.genres, 'id'),
		movies: data.movies,
		episodes: data.episodes,
		casts: data.credits?.cast?.length ?? 0,
		crews: data.credits?.crew?.length ?? 0,
		externalIds: {
			imdbId: null,
			tvdbId: null,
		},
		similar: [],
		recommendations: [],
		seasons: [
			{
				id: '1',
				seasonNumber: 1,
				name: '',
				type: 'special',
				episodes: data.specialItems.map((s, index: number) => {
					if (s.episode) {
						const title = s.episode.tv.translation?.title == ''
							? s.episode.tv.title
							: s.episode.tv.translation?.title;
						return {
							id: s.episode.id,
							title: `${title} - %S${s.episode.seasonNumber} %E${s.episode.episodeNumber}\n${s.episode.translation?.title ?? s.episode.title}`,
							overview: s.episode.translation?.overview ?? s.episode.overview,
							still: s.episode.still,
							seasonNumber: 1,
							episodeNumber: index + 1,
							available: s.episode.videoFiles.length > 0,
						};
					}
					if (s.movie) {
						return {
							id: s.movie.id,
							title: s.movie.translation?.title ?? s.movie.title,
							overview: s.movie.translation?.overview ?? s.movie.overview,
							still: s.movie.backdrop,
							seasonNumber: 1,
							episodeNumber: index + 1,
							available: s.movie.videoFiles.length > 0,
						};
					}
				}),
			},
		],
	};

	return res.json(response);

}
