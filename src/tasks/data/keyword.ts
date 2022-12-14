import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { MovieKeywords } from '../../providers/tmdb/movie/index';
import { Prisma } from '@prisma/client'
import { TvKeywords } from '../../providers/tmdb/tv/index';
import { confDb } from '../../database/config';

export default async (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	keywordsInsert: Array<Prisma.KeywordMovieCreateOrConnectWithoutMovieInput | Prisma.KeywordTvCreateOrConnectWithoutTvInput>,
	table: 'movie' | 'tv'
) => {
	for (const keyword of (req.keywords as TvKeywords).results ?? (req.keywords as MovieKeywords).keywords) {
		const keywordInsert = Prisma.validator<Prisma.KeywordUncheckedCreateInput>()({
			keywordId: keyword.id,
			name: keyword.name,
		});

		transaction.push(
			confDb.keyword.upsert({
				where: {
					keywordId: keyword.id,
				},
				update: keywordInsert,
				create: keywordInsert,
			})
		);

		keywordsInsert.push({
			where: {
				[`keyword_${table}_unique`]: {
					[`${table}Id`]: req.id,
					keywordId: keyword.id,
				},
			},
			create: {
				keywordId: keyword.id,
			},
		});
	}
};
