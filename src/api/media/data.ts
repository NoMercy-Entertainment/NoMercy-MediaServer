import {
	Episode,
	Folder,
	GenreMovie,
	GenreTv,
	Library,
	LibraryFolder,
	Media,
	Movie,
	Prisma,
	Season,
	Translation,
	Tv,
	UserData,
	VideoFile,
} from '@prisma/client';

import { LibraryResponseContent } from 'types/server';
import { createTitleSort } from '../../tasks/files/filenameParser';
import { parseYear } from '../../functions/dateTime';

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
	})[];
};

export const getContent = async (data: LibraryWithTvAndMovie, translations: Translation[], servers: string[]) => {
	const response: LibraryResponseContent[] = [];

	for (const tv of data.Tv) {
		const title = translations.find((t) => t.translationableType == 'tv' && t.translationableId == tv.id)?.title || tv.title;
		const overview = translations.find((t) => t.translationableType == 'tv' && t.translationableId == tv.id)?.overview || tv.overview;
		const logo = tv.Media.find((m) => m.type == 'logo')?.src ?? null;
		const userData = tv.UserData?.[0];

		const files = [
			...tv.Season.filter((t) => t.seasonNumber > 0)
				.map((s) => s.Episode.map((e) => e.VideoFile).flat())
				.flat()
				.map((f) => f.episodeId),
			// ...external?.find(t => t.id == tv.id && t.files)?.files ?? [],
		];
		// .filter((v, i, a) => a.indexOf(v) === i);

		response.push({
			id: tv.id,
			backdrop: tv.backdrop,
			favorite: userData?.isFavorite ?? false,
			watched: userData?.played ?? false,
			// files: servers?.length > 0 ? undefined : files,
			logo: logo,
			mediaType: data.type,
			numberOfEpisodes: tv.numberOfEpisodes ?? 1,
			// haveEpisodes: Math.floor(Math.random() * (tv.numberOfEpisodes ?? 1) + 1) ?? 0,
			haveEpisodes: files.length,
			overview: overview,
			poster: tv.poster,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: createTitleSort(title[0].toUpperCase() + title.slice(1)),
			type: tv.type ?? 'unknown',
			genres: tv.Genre,
			year: parseYear(tv.firstAirDate),
		});
	}
	for (const movie of data.Movie) {
		const title = translations.find((t) => t.translationableType == 'movie' && t.translationableId == movie.id)?.title || movie.title;
		const overview =
			translations.find((t) => t.translationableType == 'movie' && t.translationableId == movie.id)?.overview || movie.overview;
		const logo = movie.Media.find((m) => m.type == 'logo')?.src ?? null;
		const userData = movie.UserData?.[0];

		response.push({
			id: movie.id,
			backdrop: movie.backdrop,
			favorite: userData?.isFavorite ?? false,
			watched: userData?.played ?? false,
			logo: logo,
			mediaType: 'movies',
			overview: overview,
			poster: movie.poster,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: createTitleSort(title[0].toUpperCase() + title.slice(1)),
			type: data.type,
			genres: movie.Genre,
			year: parseYear(movie.releaseDate),
		});
	}

	return response;
};

export const translationQuery = ({ ids, language }) => {
	return Prisma.validator<Prisma.TranslationFindManyArgs>()({
		where: {
			translationableId: { in: ids },
			iso6391: language,
		},
	});
};

export const ownerQuery = (id?: string) => {
	return Prisma.validator<Prisma.LibraryFindManyArgs>()({
		where: {
			id: id ? id : undefined,
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
								some: {
									duration: {
										not: null,
									},
								},
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
						every: {
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
					libraryId: id ? id : undefined,
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
									Media: {
										orderBy: {
											voteAverage: 'desc',
										},
									},
									Genre: true,
									Season: {
										orderBy: {
											seasonNumber: 'asc',
										},
										include: {
											Episode: {
												orderBy: {
													episodeNumber: 'asc',
												},
												where: {
													VideoFile: {
														some: {
															duration: {
																not: null,
															},
														},
													},
												},
												include: {
													VideoFile: true,
												},
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
