/* eslint-disable indent */

import { LibraryResponseContent } from 'types/server';

import {
	Collection, Episode, Folder, GenreMovie, GenreTv, Library, LibraryFolder, Media, Movie, Prisma,
	Season, Translation, Tv, UserData, VideoFile
} from '../../database/config/client';
import { parseYear } from '../../functions/dateTime';
import { createTitleSort } from '../../tasks/files/filenameParser';

export type LibraryWithTvAndMovie = Library & {
	Folders: (LibraryFolder & {
		folder: Folder | null;
	})[];
	Tv: (Tv & {
		Genre: GenreTv[];
		UserData: UserData[];
		Media: Media[];
		Season: (Season & {
			Episode: (Episode & {
				VideoFile: VideoFile[];
			})[];
		})[];
	})[];
	Movie: (Movie & {
		UserData: UserData[];
		Genre: GenreMovie[];
		Media: Media[];
		VideoFile: VideoFile[];
		Collection: (Collection & {
			Movie: Movie[];
		})[];
	})[];
};

export const getContent = (data: LibraryWithTvAndMovie, translations: Translation[]) => {
	const response: LibraryResponseContent[] = [];

	for (const tv of data.Tv) {
		const title = translations.find(t => t.tvId == tv.id)?.title || tv.title;
		const overview = translations.find(t => t.tvId == tv.id)?.overview || tv.overview;
		const logo = tv.Media.find(m => m.type == 'logo');
		const userData = tv.UserData?.[0];

		const files = [
			...tv.Season.filter(t => t.seasonNumber > 0)
				.map(s => s.Episode.map(e => e.VideoFile).flat())
				.flat()
				.map(f => f.episodeId),
			// ...external?.find(t => t.id == tv.id && t.files)?.files ?? [],
		];
		// .filter((v, i, a) => a.indexOf(v) === i);

		const hash = JSON.parse(tv.blurHash ?? '{}');

		response.push({
			id: tv.id,
			backdrop: tv.backdrop,
			favorite: userData?.isFavorite ?? false,
			watched: userData?.played ?? false,
			// files: servers?.length > 0 ? undefined : files,
			logo: logo?.src,
			mediaType: data.type,
			numberOfEpisodes: tv.numberOfEpisodes ?? 1,
			haveEpisodes: files.length,
			overview: overview,
			blurHash: {
				logo: logo?.blurHash ?? null,
				poster: hash?.poster ?? null,
				backdrop: hash?.backdrop ?? null,
			},
			poster: tv.poster,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: createTitleSort(title, tv.firstAirDate),
			type: tv.type ?? 'unknown',
			genres: tv.Genre,
			year: parseYear(tv.firstAirDate),
		});
	}
	for (const movie of data.Movie) {
		const title = translations.find(t => t.movieId == movie.id)?.title || movie.title;
		const overview
			= translations.find(t => t.movieId == movie.id)?.overview || movie.overview;
		const logo = movie.Media.find(m => m.type == 'logo');
		const userData = movie.UserData?.[0];

		const hash = JSON.parse(movie.blurHash ?? '{}');

		response.push({
			id: movie.id,
			backdrop: movie.backdrop,
			favorite: userData?.isFavorite ?? false,
			watched: userData?.played ?? false,
			logo: logo?.src ?? null,
			mediaType: 'movie',
			overview: overview,
			blurHash: {
				// logo: logo?.blurHash ?? null,
				poster: hash?.poster ?? null,
				backdrop: hash?.backdrop ?? null,
			},
			poster: movie.poster,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: createTitleSort(title, movie.releaseDate),
			type: data.type,
			genres: movie.Genre,
			year: parseYear(movie.releaseDate),
			collection: movie.Collection?.map(c => ({
				id: c.id,
				backdrop: c.backdrop,
				mediaType: 'collection',
				poster: c.poster,
				title: c.title[0].toUpperCase() + c.title.slice(1),
				titleSort: createTitleSort(c.title),
				type: 'collection',
			})),
		});
	}

	return response;
};

export const translationQuery = ({ ids, language }) => {
	return Prisma.validator<Prisma.TranslationFindManyArgs>()({
		where: {
			iso6391: language,
			OR: [
				{
					movieId: {
						in: ids,
					},
				},
				{
					tvId: {
						in: ids,
					},
				},
			],
		},
	});
};

export const ownerQuery = (id?: string) => {
	return Prisma.validator<Prisma.LibraryFindManyArgs>()({
		where: {
			id: id
				? id
				: undefined,
		},
		include: {
			Folders: {
				include: {
					folder: true,
				},
			},
			Tv: {
				include: {
					UserData: true,
					Genre: true,
					Media: {
						orderBy: {
							voteAverage: 'desc',
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
				where: {
					Episode: {
						some: {
							VideoFile: {
								some: {},
							},
						},
					},
				},
				orderBy: {
					titleSort: 'asc',
				},
			},
			Movie: {
				where: {
					folder: {
						not: null,
					},
					VideoFile: {
						some: {
							duration: {
								not: null,
							},
						},
					},
				},
				include: {
					UserData: true,
					Media: {
						orderBy: {
							voteAverage: 'desc',
						},
					},
					Genre: true,
					VideoFile: true,
					CollectionFrom: {
						include: {
							Movie: true,
						},
					},
				},
				orderBy: {
					titleSort: 'asc',
				},
			},
		},
	});
};

export const userQuery = (userId: string, id?: string) => {
	return Prisma.validator<Prisma.UserFindManyArgs>()({
		where: {
			sub_id: userId,
		},
		include: {
			Libraries: {
				where: {
					libraryId: id
						? id
						: undefined,
				},
				include: {
					library: {
						include: {
							Folders: {
								include: {
									folder: true,
								},
							},
							Tv: {
								include: {
									UserData: true,
									Genre: true,
									Media: {
										orderBy: {
											voteAverage: 'desc',
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
								where: {
									Episode: {
										some: {
											VideoFile: {
												some: {},
											},
										},
									},
								},
								orderBy: {
									titleSort: 'asc',
								},
							},
							Movie: {
								where: {
									folder: {
										not: null,
									},
									VideoFile: {
										some: {
											duration: {
												not: null,
											},
										},
									},
								},
								include: {
									UserData: true,
									Media: {
										orderBy: {
											voteAverage: 'desc',
										},
									},
									VideoFile: true,
									Genre: true,
									CollectionFrom: {
										include: {
											Movie: true,
										},
									},
								},
								orderBy: {
									titleSort: 'asc',
								},
							},
						},
					},
				},
			},
		},
	});
};
