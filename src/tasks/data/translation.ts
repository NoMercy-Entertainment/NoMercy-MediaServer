import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { MovieTranslation } from '../../providers/tmdb/movie/index';
import { PersonAppend } from '../../providers/tmdb/people/details';
import { Prisma } from '../../database/config/client';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import { TvShowTranslation } from '../../providers/tmdb/tv/index';
import { confDb } from '../../database/config';

export default async (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | CompleteMovieAggregate | PersonAppend,
	transaction: Prisma.PromiseReturnType<any>[],
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person'
) => {
	for (const translation of req.translations.translations as Array<MovieTranslation | TvShowTranslation>) {
		const translationsInsert = Prisma.validator<Prisma.TranslationUncheckedCreateInput>()({
			englishName: translation.english_name,
			homepage: translation.homepage,
			iso31661: translation.iso_3166_1,
			iso6391: translation.iso_639_1,
			name: translation.name,
			overview: translation.data?.overview,
			title: (translation as MovieTranslation).data?.title || (translation as TvShowTranslation).data?.name,

			movieId: table === 'movie'
				? req.id
				: undefined,
			tvId: table === 'tv'
				? req.id
				: undefined,
			seasonId: table === 'season'
				? req.id
				: undefined,
			episodeId: table === 'episode'
				? req.id
				: undefined,
			personId: table === 'person'
				? req.id
				: undefined,
		});

		if (table === 'tv') {
			// transaction.push(
			await	confDb.translation.upsert({
				where: {
					tvId_iso31661_iso6391: {
						tvId: req.id,
						iso31661: translation.iso_3166_1,
						iso6391: translation.iso_639_1,
					},
				},
				update: translationsInsert,
				create: translationsInsert,
			});
			// );
		} else if (table === 'movie') {
			// transaction.push(
			await	confDb.translation.upsert({
				where: {
					movieId_iso31661_iso6391: {
						movieId: req.id,
						iso31661: translation.iso_3166_1,
						iso6391: translation.iso_639_1,
					},
				},
				update: translationsInsert,
				create: translationsInsert,
			});
			// );
		} else if (table === 'season') {
			// transaction.push(
			await	confDb.translation.upsert({
				where: {
					seasonId_iso31661_iso6391: {
						seasonId: req.id,
						iso31661: translation.iso_3166_1,
						iso6391: translation.iso_639_1,
					},
				},
				update: translationsInsert,
				create: translationsInsert,
			});
			// );
		} else if (table === 'episode') {
			// transaction.push(
			await	confDb.translation.upsert({
				where: {
					episodeId_iso31661_iso6391: {
						episodeId: req.id,
						iso31661: translation.iso_3166_1,
						iso6391: translation.iso_639_1,
					},
				},
				update: translationsInsert,
				create: translationsInsert,
			});
			// );
		} else if (table === 'person') {
			// transaction.push(
			// await	confDb.translation.upsert({
			// 	where: {
			// 		personId_iso31661_iso6391: {
			// 			personId: req.id,
			// 			iso31661: translation.iso_3166_1,
			// 			iso6391: translation.iso_639_1,
			// 		},
			// 	},
			// 	update: translationsInsert,
			// 	create: translationsInsert,
			// });
			// );
		}
	}
};
