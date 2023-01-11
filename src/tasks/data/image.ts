import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import { Image } from '../../providers/tmdb/shared/index';
import { MovieAppend } from '../../providers/tmdb/movie/index';
import { PersonAppend } from '../../providers/tmdb/people/index';
import { CompleteTvAggregate } from './fetchTvShow';
import { CompleteMovieAggregate } from './fetchMovie';
import colorPalette from '../../functions/colorPalette/colorPalette';
import { PaletteColors } from 'types/server';
import createBlurHash from '../../functions/createBlurHash/createBlurHash';

export default async (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | MovieAppend | PersonAppend | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	type: 'backdrop' | 'logo' | 'poster' | 'still' | 'profile',
	table: 'movie' | 'tv' | 'season' | 'episode' | 'person' | 'video'
) => {
	if(!req.images[`${type}s`]) return;
	
	for (const image of req.images[`${type}s`] as Array<Image>) {
		
		let blurHash: string | undefined = undefined;
		let pallette: PaletteColors | null = <PaletteColors>{};

		if(image.file_path){
			pallette = await colorPalette(`https://image.tmdb.org/t/p/w185${image.file_path}`)
				.then((data) => data)
				.catch(() => null);

			blurHash = await createBlurHash(`https://image.tmdb.org/t/p/w185${image.file_path}`);
		}

		const mediaInsert = Prisma.validator<Prisma.MediaUncheckedCreateInput>()({
			aspectRatio: image.aspect_ratio,
			height: image.height,
			iso6391: image.iso_639_1,
			src: image.file_path,
			type: type,
			voteAverage: image.vote_average,
			voteCount: image.vote_count,
			width: image.width,
			colorPalette: JSON.stringify(pallette),
			blurHash: blurHash,
			episodeId: table == 'episode' ? req.id : undefined,
			movieId: table == 'movie' ? req.id : undefined,
			personId: table == 'person' ? req.id : undefined,
			seasonId: table == 'season' ? req.id : undefined,
			tvId: table == 'tv' ? req.id : undefined,
			videoFileId: table == 'video' ? req.id : undefined,
		});

		transaction.push(
			confDb.media.upsert({
				where: {
					src: image.file_path,
				},
				update: mediaInsert,
				create: mediaInsert,
			})
		);
		
	}

}
