import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';
import { isOwner } from '../../middleware/permissions';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	return res.json({});

	// return res.json({
	// 	id: data.id,
	// 	title: title,
	// 	overview: overview,
	// 	poster: data.poster,
	// 	backdrop: data.backdrop,
	// 	blurHash: {
	// 		logo: logos[0]?.blurHash ?? null,
	// 		poster: hash?.poster ?? null,
	// 		backdrop: hash?.backdrop ?? null,
	// 	},
	// 	videos: groupedMedia.Trailer ?? [],
	// 	backdrops: groupedMedia.backdrop?.map((i: Image) => ({ ...i, colorPalette: JSON.parse(i.colorPalette ?? '{}') })) ?? [],
	// 	logos: logos,
	// 	posters: groupedMedia.poster?.map((i: Image) => ({ ...i, colorPalette: JSON.parse(i.colorPalette ?? '{}') })) ?? [],
	// 	contentRatings: data.Certification.map((r) => {
	// 		return {
	// 			rating: r.Certification.rating,
	// 			meaning: r.Certification.meaning,
	// 			order: r.Certification.order,
	// 			iso31661: r.Certification.iso31661,
	// 		};
	// 	}),
	// 	watched: data.UserData?.[0]?.played ?? false,
	// 	favorite: data.UserData?.[0]?.isFavorite ?? false,
	// 	titleSort: data.titleSort,
	// 	duration: data.duration,
	// 	numberOfEpisodes: data.numberOfEpisodes ?? 1,
	// 	haveEpisodes: files.length,
	// 	year: new Date(Date.parse(data.firstAirDate!)).getFullYear(),
	// 	voteAverage: data.voteAverage,
	// 	similar: similar.map(s => ({ ...s, blurHash: JSON.parse(s.blurHash ?? '') })),
	// 	recommendations: recommendations.map(s => ({ ...s, blurHash: JSON.parse(s.blurHash ?? '') })),
	// 	externalIds: {
	// 		imdbId: data.imdbId,
	// 		tvdbId: data.tvdbId,
	// 	},
	// 	creators:
	// 		data.Creators?.filter(c => c.Creator.name)
	// 			.slice(0, 10)
	// 			.map(c => ({
	// 				id: c.Creator.personId,
	// 				name: c.Creator.name,
	// 			})) ?? [],
	// 	directors:
	// 		data.Crew.filter(c => c.Crew.department == 'Directing')
	// 			.slice(0, 10)
	// 			.map(c => ({
	// 				id: c.Crew.personId,
	// 				name: c.Crew.name,
	// 			})) ?? [],
	// 	writers:
	// 		data.Crew.filter(c => c.Crew.department == 'Writing')
	// 			.slice(0, 10)
	// 			.map(c => ({
	// 				id: c.Crew.personId,
	// 				name: c.Crew.name,
	// 			})) ?? [],
	// 	genres:
	// 		data.Genre.map(g => ({
	// 			id: g.Genre.id,
	// 			name: g.Genre.name,
	// 		})) ?? [],
	// 	keywords: data.Keyword.map(c => c.Keyword.name),
	// 	type: data.Library.type == 'tv'
	// 		? 'tv'
	// 		: 'movies',
	// 	mediaType: data.Library.type == 'tv'
	// 		? 'tv'
	// 		: 'movies',
	// 	cast: data.Cast.map(c => c.Cast).map((c) => {
	// 		return {
	// 			gender: c.gender,
	// 			id: c.personId,
	// 			creditId: c.creditId,
	// 			character: c.character,
	// 			knownForDepartment: c.knownForDepartment,
	// 			name: c.name,
	// 			profilePath: c.profilePath,
	// 			popularity: c.popularity,
	// 			deathday: c.Person?.deathday,
	// 			blurHash: c.blurHash,
	// 		};
	// 	}),
	// 	crew: data.Crew.map(c => c.Crew).map((c) => {
	// 		return {
	// 			gender: c.gender,
	// 			id: c.personId,
	// 			creditId: c.creditId,
	// 			job: c.job,
	// 			department: c.department,
	// 			knownForDepartment: c.knownForDepartment,
	// 			name: c.name,
	// 			profilePath: c.profilePath,
	// 			popularity: c.popularity,
	// 			deathday: c.Person?.deathday,
	// 			blurHash: c.blurHash,
	// 		};
	// 	}),
	// 	director: data.Crew.filter(c => c.Crew.department == 'Directing')
	// 		.map(c => c.Crew)
	// 		.map(c => ({
	// 			id: c.personId,
	// 			name: c.name,
	// 			blurHash: c.blurHash,
	// 		})),
	// 	seasons: data.Season.map((s) => {

	// 		return {
	// 			id: s.id,
	// 			overview: s.overview,
	// 			poster: s.poster,
	// 			seasonNumber: s.seasonNumber,
	// 			title: s.title,
	// 			blurHash: s.blurHash,
	// 			Episode: undefined,
	// 			episodes: s.Episode.map((e) => {
	// 				let progress: null | number = null;

	// 				if (e.VideoFile[0] && e.VideoFile[0].duration && e.VideoFile[0]?.UserData?.[0]?.time) {
	// 					progress = (e.VideoFile[0]?.UserData?.[0]?.time / convertToSeconds(e.VideoFile[0].duration) * 100);
	// 				}

	// 				return {
	// 					id: e.id,
	// 					episodeNumber: e.episodeNumber,
	// 					seasonNumber: e.seasonNumber,
	// 					title: e.title,
	// 					overview: e.overview,
	// 					airDate: e.airDate,
	// 					still: e.still,
	// 					blurHash: e.blurHash,
	// 					progress: progress,
	// 				};
	// 			}),
	// 		};
	// 	}),
	// });

}
