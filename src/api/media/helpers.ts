/* eslint-disable indent */

import {
	AlternativeTitles,
	Cast,
	Certification,
	CertificationMovie,
	CertificationTv,
	Collection,
	Creator,
	Crew,
	Episode,
	Genre,
	GenreMovie,
	GenreTv,
	Image,
	Job,
	Keyword,
	KeywordMovie,
	KeywordTv,
	Library,
	Media,
	Movie,
	Person,
	Recommendation,
	Role,
	Season,
	Similar,
	Tv,
	UserData,
	VideoFile
} from '../../database/config/client';
import {
	InfoCredit,
	MediaItem,
	Recommendation as RecommendationResponse,
	Similar as SimilarResponse
} from '../../types/server';

import { Image as TMDBImage } from '../../providers/tmdb/shared';
import colorPalette from '@/functions/colorPalette/colorPalette';

export type TvWithEpisodes = Tv & {
	Season: (Season & {
		Episode: (Episode & {
			VideoFile: (VideoFile & {
				UserData: UserData[]
			})[];
		})[];
	})[];
};

export type TvWithInfo = Tv & {
	AlternativeTitles: AlternativeTitles[];
	Creator?: (Creator & {
		Person: Person;
	})[];
	Cast: (Cast & {
		Image: Image;
		Person: Person | null;
        Roles: Role[];
	})[];
	Crew: (Crew & {
        Person: Person | null;
        Jobs: Job[];
	})[];
	Certification: (CertificationTv & {
		Certification: Certification;
	})[];
	Genre: (GenreTv & {
		Genre: Genre;
	})[];
	Keyword: (KeywordTv & {
		Keyword: Keyword;
	})[];
    Season: (Season & {
        Episode: (Episode & {
            VideoFile: (VideoFile & {
                UserData: UserData[];
            })[];
        })[];
    })[];
	Library: Library;
	Media: Media[];
	UserData: UserData[];
	SimilarFrom: (Similar & {
		TvTo: Tv | null;
	})[];
	RecommendationFrom: (Recommendation & {
		TvTo: Tv | null;
	})[];
};

export type MovieWithInfo = (Movie & {
    AlternativeTitles: AlternativeTitles[];
    Cast: (Cast & {
		Image: Image;
		Person: Person | null;
        Roles: Role[];
    })[];
	CollectionFrom: (Collection & {
		Movie: Movie | Movie[];
	})[];
	Crew: (Crew & {
		Person: Person | null;
		Jobs: Job[];
	})[];
	Certification: (CertificationMovie & {
		Certification: Certification;
	})[];
	Genre: (GenreMovie & {
		Genre: Genre;
	})[];
	Keyword: (KeywordMovie & {
		Keyword: Keyword;
	})[];
	// SpecialItem: SpecialItem[];
	// VideoFile: VideoFile[];
	Library: Library;
	Media: Media[];
	UserData: UserData[];
	SimilarFrom: (Similar & {
		MovieTo: Movie | null;
	})[];
	RecommendationFrom: (Recommendation & {
		MovieTo: Movie | null;
	})[];
});

export const relatedMap = (data: TvWithInfo['SimilarFrom'] | TvWithInfo['RecommendationFrom'] | MovieWithInfo['SimilarFrom'] | MovieWithInfo['RecommendationFrom'], type: string)
: Array<SimilarResponse|RecommendationResponse> => data.map((s) => {
	return {
		backdrop: s.backdrop,
		id: s.mediaId as number,
		overview: s.overview,
		poster: s.poster,
		title: s.title,
		titleSort: s.titleSort,
		mediaType: type,
		numberOfEpisodes: s[`${type.toUcFirst()}To`]?.numberOfEpisodes ?? null,
		haveEpisodes: s[`${type.toUcFirst()}To`]?.haveEpisodes ?? null,
		blurHash: JSON.parse(s.blurHash ?? '{}'),
		colorPalette: JSON.parse(s.colorPalette ?? '{}'),
	};
}) ?? [];

export const imageMap = async (data: Array<Media | TMDBImage>): Promise<MediaItem[]> => {
	const res: MediaItem[] = [];

	for (const i of data?.filter(Boolean) ?? []) {

		if (((i as Media).src ?? (i as TMDBImage).file_path) != null && (i as Media).colorPalette === null) {
			(i as Media).colorPalette = JSON.stringify(await colorPalette((i as Media).src ?? (i as TMDBImage).file_path) ?? {});
		}

		res.push({
			aspectRatio: (i as Media).aspectRatio ?? (i as TMDBImage).aspect_ratio,
			height: (i as Media).height,
			id: (i as Media).id,
			iso6391: (i as Media).iso6391 ?? (i as TMDBImage).iso_639_1,
			src: (i as Media).src ?? (i as TMDBImage).file_path,
			width: i.width,
			blurHash: (i as Media).blurHash,
			colorPalette: JSON.parse((i as Media).colorPalette ?? '{}'),
			voteAverage: (i as Media).voteAverage ?? (i as TMDBImage).vote_average,
			voteCount: (i as Media).voteCount ?? (i as TMDBImage).vote_count,
		});
	}
	return res;
};

export type People = (Crew & {
	Person: Person | null;
	Jobs: Job[];
}) | (Cast & {
	Image: Image;
	Person: Person | null;
	Roles: Role[];
});

export const peopleMap = (data: Array<People>, filter: string): InfoCredit[] => {
	return data.map((c) => {
		return {
			gender: c.Person!.gender,
			id: c.Person!.id,
			creditId: c[filter]?.[0].creditId,
			character: c[filter]?.map(c => c.character || c.job || 'unknown')?.join(', '),
			knownForDepartment: c.Person!.knownForDepartment,
			name: c.Person!.name,
			profilePath: (c as any).Image?.filePath ?? c.Person?.profile,
			popularity: c.Person!.popularity,
			deathday: c.Person!.deathday,
			blurHash: c.Person!.blurHash,
			colorPalette: JSON.parse(c.Person!.colorPalette ?? '{}'),
		};
	}) ?? [];
};

export type Department = (Crew & {
	Person: Person | null;
	Jobs: Job[];
});

export const getFromDepartmentMap = (data: Department[], type: string, filter: string) => {
	return data.filter(c => !!c[`${type.toUcFirst()}s`].find(d => d[type] == filter))?.filter(Boolean)
		.slice(0, 3)
		.map(c => ({
			id: c.Person!.id,
			name: c.Person!.name!,
			blurHash: c.Person!.blurHash,
			colorPalette: c.Person!.colorPalette,
		})) ?? [];
};
