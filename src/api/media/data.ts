/* eslint-disable indent */

import { LibraryResponseContent } from '@server/types/server';
import { MovieTranslations } from '@server/providers/tmdb/movie';
import { TvShowTranslations } from '@server/providers/tmdb/tv';
import { Library } from '@server/db/media/actions/libraries';
import { FolderLibrary } from '@server/db/media/actions/folder_library';
import { Folder } from '@server/db/media/actions/folders';
import { GenreTv } from '@server/db/media/actions/genre_tv';
import { UserData } from '@server/db/media/actions/userData';
import { Media } from '@server/db/media/actions/medias';
import { Season } from '@server/db/media/actions/seasons';
import { Episode } from '@server/db/media/actions/episodes';
import { VideoFile } from '@server/db/media/actions/videoFiles';
import { Translation } from '@server/db/media/actions/translations';
import { Movie } from '@server/db/media/actions/movies';
import { GenreMovie } from '@server/db/media/actions/genre_movie';
import { Collection } from '@server/db/media/actions/collections';
import { Tv } from '@server/db/media/actions/tvs';

export type LibraryWithTvAndMovie = Library & {
	Folders: (FolderLibrary & {
		folder: Folder | null;
	})[];
	tv: (Tv & {
		genre: GenreTv[];
		userData: UserData[];
		media: Media[];
		season: (Season & {
			episode: (Episode & {
				videoFile: VideoFile[];
			})[];
		})[];
		translations: (TvShowTranslations & {
			translation: Translation[];
		})[];
	})[];
	movie: (Movie & {
		userData: UserData[];
		genre: GenreMovie[];
		media: Media[];
		videoFile: VideoFile[];
		collection: (Collection & {
			movie: Movie[];
		})[];
		translations: (MovieTranslations & {
			translation: Translation[];
		})[];
	})[];
};

export const getContent = (data: LibraryWithTvAndMovie) => {
	const response: LibraryResponseContent[] = [];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const tv of data.tv) {
		// const title = data.Translations.find(t => t.tvId == tv.id)?.title || tv.title;
		// const overview = data.Translations.find(t => t.tvId == tv.id)?.overview || tv.overview;
		// const logo = tv.media.find(m => m.type == 'logo');
		// const userData = tv.userData?.[0];

		// const files = [
		// 	...tv.season.filter(t => t.seasonNumber > 0)
		// 		.map(s => s.episode.map(e => e.videoFile).flat())
		// 		.flat()
		// 		.map(f => f.episode_id),
		// 	// ...external?.find(t => t.id == tv.id && t.files)?.files ?? [],
		// ];
		// // .filter((v, i, a) => a.indexOf(v) === i);

		// const hash = JSON.parse(tv.blurHash ?? '{}');
		// const palette = JSON.parse(tv.colorPalette ?? '{}');

		// response.push({
		// 	id: tv.id,
		// 	backdrop: tv.backdrop,
		// 	// favorite: userData?.isFavorite ?? false,
		// 	// watched: userData?.played ?? false,
		// 	// files: servers?.length > 0 ? undefined : files,
		// 	logo: logo?.src,
		// 	mediaType: data.type,
		// 	numberOfEpisodes: tv.numberOfEpisodes ?? 1,
		// 	haveEpisodes: files.length,
		// 	overview: tv.overview,
		// 	blurHash: {
		// 		logo: logo?.blurHash ?? null,
		// 		poster: hash?.poster ?? null,
		// 		backdrop: hash?.backdrop ?? null,
		// 	},
		// 	color_palette: {
		// 		logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
		// 		poster: palette?.poster ?? null,
		// 		backdrop: palette?.backdrop ?? null,
		// 	},
		// 	poster: tv.poster,
		// 	title: tv.title[0].toUpperCase() + tv.title.slice(1),
		// 	// titleSort: createTitleSort(tv.title, tv.firstAirDate),
		// 	type: tv.type ?? 'unknown',
		// 	genres: tv.genre,
		// 	// year: parseYear(tv.firstAirDate),
		// });
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const movie of data.movie) {
		// const title = translations.find(t => t.movieId == movie.id)?.title || movie.title;
		// const overview
		// 	= translations.find(t => t.movieId == movie.id)?.overview || movie.overview;
		// const logo = movie.media.find(m => m.type == 'logo');
		// const userData = movie.userData?.[0];

		// const hash = JSON.parse(movie.blurHash ?? '{}');
		// const palette = JSON.parse(movie.colorPalette ?? '{}');

		// response.push({
		// 	id: movie.id,
		// 	backdrop: movie.backdrop,
		// 	favorite: userData?.isFavorite ?? false,
		// 	watched: userData?.played ?? false,
		// 	logo: logo?.src ?? null,
		// 	mediaType: 'movie',
		// 	overview: movie.overview,
		// 	blurHash: {
		// 		logo: logo?.blurHash ?? null,
		// 		poster: hash?.poster ?? null,
		// 		backdrop: hash?.backdrop ?? null,
		// 	},
		// 	color_palette: {
		// 		logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
		// 		poster: palette?.poster ?? null,
		// 		backdrop: palette?.backdrop ?? null,
		// 	},
		// 	poster: movie.poster,
		// 	title: movie.title[0].toUpperCase() + movie.title.slice(1),
		// 	titleSort: createTitleSort(movie.title, movie.releaseDate),
		// 	type: data.type,
		// 	genres: movie.genre,
		// 	year: parseYear(movie.releaseDate),
		// 	collection: movie.collection?.map(c => ({
		// 		id: c.id,
		// 		backdrop: c.backdrop,
		// 		mediaType: 'collection',
		// 		poster: c.poster,
		// 		title: c.title[0].toUpperCase() + c.title.slice(1),
		// 		titleSort: createTitleSort(c.title),
		// 		color_palette: JSON.parse(c.colorPalette ?? '[]'),
		// 		type: 'collection',
		// 	})),
		// });
	}

	return response;
};

export const ownerQuery = (language: string) => {
	return {
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
					Translation: {
						where: {
							iso6391: {
								in: ['en', language],
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
					Translation: {
						where: {
							iso6391: {
								in: ['en', language],
							},
						},
					},
				},
				orderBy: {
					titleSort: 'asc',
				},
			},
		},
	};
};

export const userQuery = (userId: string, language: string) => {
	return {
		where: {
			sub_id: userId,
		},
		include: {
			Libraries: {
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
									Translation: {
										where: {
											iso6391: {
												in: ['en', language],
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
									Translation: {
										where: {
											iso6391: {
												in: ['en', language],
											},
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
	};
};
