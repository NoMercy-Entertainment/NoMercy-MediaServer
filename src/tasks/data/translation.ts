import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { MovieTranslation } from '../../providers/tmdb/movie/index';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import { TvShowTranslation } from '../../providers/tmdb/tv/index';
import { CompleteTvAggregate } from './fetchTvShow';
import { CompleteMovieAggregate } from './fetchMovie';

export default async (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	table: 'movie' | 'tv' | 'season' | 'episode'
) => {
	for (const translation of req.translations.translations as Array<MovieTranslation | TvShowTranslation>) {
		const translationsInsert = Prisma.validator<Prisma.TranslationCreateInput>()({
			englishName: translation.english_name,
			homepage: translation.homepage,
			iso31661: translation.iso_3166_1,
			iso6391: translation.iso_639_1,
			name: translation.name,
			overview: translation.data?.overview,
			title: (translation as MovieTranslation).data?.title || (translation as TvShowTranslation).data?.name,
			translationableId: req.id,
			translationableType: table,
		});

		transaction.push(
			confDb.translation.upsert({
				where: {
					translationableId_translationableType_iso6391: {
						translationableId: req.id,
						translationableType: table,
						iso6391: translation.iso_639_1,
					},
				},
				update: translationsInsert,
				create: translationsInsert,
			})
		);
	}
};
