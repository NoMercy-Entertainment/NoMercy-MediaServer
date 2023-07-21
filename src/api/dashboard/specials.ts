import { Request, Response } from 'express';

import Logger from '@server/functions/logger';
import colorPalette from '@server/functions/colorPalette/colorPalette';
// import createBlurHash from '@server/functions/createBlurHash/createBlurHash';
import { asc, eq } from 'drizzle-orm';
import { specials } from '@server/db/media/schema/specials';
import { specialItems } from '@server/db/media/schema/specialItems';
import { Tv } from '@server/db/media/actions/tvs';
import { Movie } from '@server/db/media/actions/movies';
import { Episode } from '@server/db/media/actions/episodes';

export const specialz = (req: Request, res: Response) => {

	try {
		const data = globalThis.mediaDb.query.specials.findMany({
			with: {
				specialItems: {
					with: {
						movie: true,
						episode: true,
					},
				},
			},
		});

		return res.json(data);

	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `Error getting specials: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting specials: ${error}`,
		});

	}
};

export const special = (req: Request, res: Response) => {

	try {
		const data = globalThis.mediaDb.query.specials.findFirst({
			where: eq(specials.id, req.params.id),
			with: {
				specialItems: {
					with: {
						movie: true,
						episode: {
							with: {
								tv: true,
							},
						},
					},
				},
			},
			orderBy: asc(specialItems.order),
		});

		const response = {
			...data,
			item: data?.specialItems.map(d => ({
				...d,
				id: (d as any)?.episodeId ?? (d as any)?.movieId,
				movie: d.movie
					? {
						...d.movie,
					}
					: undefined,
				episode: d.episode
					? {
						...d.episode,
						tv: d.episode.tv
							? {
								show: d.episode.tv.title,
								duration: d.episode.tv.duration,
							}
							: undefined,
					}
					: undefined,
			})),
		};
		return res.json(response);

	} catch (error) {

		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `Error getting specials: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting specials: ${error}`,
		});
	}
};

export interface updateSpecialsParams {
	sub_id: string;
}
export const createSpecials = async (req: Request, res: Response) => {

	const palette: any = {
		poster: undefined,
		backdrop: undefined,
	};

	const blurHash: any = {
		poster: undefined,
		backdrop: undefined,
	};

	await Promise.all([
		// req.body.poster && createBlurHash(`https://image.tmdb.org/t/p/w185${req.body.poster}`).then((hash) => {
		// 	blurHash.poster = hash;
		// }),
		// req.body.backdrop && createBlurHash(`https://image.tmdb.org/t/p/w185${req.body.backdrop}`).then((hash) => {
		// 	blurHash.backdrop = hash;
		// }),
		req.body.poster && colorPalette(`https://image.tmdb.org/t/p/w185${req.body.poster}`).then((hash) => {
			palette.poster = hash;
		}),
		req.body.backdrop && colorPalette(`https://image.tmdb.org/t/p/w185${req.body.backdrop}`).then((hash) => {
			palette.backdrop = hash;
		}),
	]);

	// confDb.special.upsert({
	// 	where: {
	// 		title: req.body.title,
	// 	},
	// 	create: {
	// 		title: req.body.title,
	// 		backdrop: req.body.backdrop,
	// 		poster: req.body.poster,
	// 		description: req.body.description,
	// 		id: req.body.id,
	// 		blurHash: JSON.stringify(blurHash),
	// 		colorPalette: JSON.stringify(palette),
	// 	},
	// 	update: {
	// 		title: req.body.title,
	// 		backdrop: req.body.backdrop,
	// 		poster: req.body.poster,
	// 		description: req.body.description,
	// 		id: req.body.id,
	// 		blurHash: JSON.stringify(blurHash),
	// 		colorPalette: JSON.stringify(palette),
	// 	},
	// })
	// 	.then((data) => {
	// 		return res.json({
	// 			status: 'ok',
	// 			message: `Special created: ${data.title}`,
	// 			data,
	// 		});
	// 	});
};

export interface updateSpecialsParams {
	sub_id: string;
}
export const updateSpecials = async (req: Request, res: Response) => {

	// await confDb.specialItem.deleteMany({
	// 	where: {
	// 		specialId: req.body.id,
	// 	},
	// });

	const palette: any = {
		poster: undefined,
		backdrop: undefined,
	};

	const blurHash: any = {
		poster: undefined,
		backdrop: undefined,
	};

	await Promise.all([
		// req.body.poster && createBlurHash(`https://image.tmdb.org/t/p/w185${req.body.poster}`).then((hash) => {
		// 	blurHash.poster = hash;
		// }),
		// req.body.backdrop && createBlurHash(`https://image.tmdb.org/t/p/w185${req.body.backdrop}`).then((hash) => {
		// 	blurHash.backdrop = hash;
		// }),
		req.body.poster && colorPalette(`https://image.tmdb.org/t/p/w185${req.body.poster}`).then((hash) => {
			palette.poster = hash;
		}),
		req.body.backdrop && colorPalette(`https://image.tmdb.org/t/p/w185${req.body.backdrop}`).then((hash) => {
			palette.backdrop = hash;
		}),
	]);

	const specialInsert = {
		title: req.body.title,
		backdrop: req.body.backdrop,
		poster: req.body.poster,
		description: req.body.description,
		blurHash: JSON.stringify(blurHash),
		colorPalette: JSON.stringify(palette),
		id: req.body.id,
		item: req.body.item
			? {
				connectOrCreate: req.body.Item.map((item: any) => ({
					where: {
						movieId: item.movieId ?? undefined,
						episodeId: item.episodeId ?? undefined,
					},
					create: {
						...item,
						id: undefined,
						item: undefined,
						specialId: undefined,
					},
				})),
			}
			: undefined,
	};

	// confDb.special.update({
	// 	where: {
	// 		id: req.body.id,
	// 	},
	// 	data: specialInsert,
	// })
	// 	.then((data) => {
	// 		return res.json({
	// 			status: 'ok',
	// 			message: `Special updated: ${data.title}`,
	// 			data,
	// 		});
	// 	})
	// 	.catch((error) => {
	// 		Logger.log({
	// 			level: 'info',
	// 			name: 'access',
	// 			color: 'magentaBright',
	// 			message: `Error updating special: ${error}`,
	// 		});
	// 		return res.json({
	// 			status: 'error',
	// 			message: `Something went wrong updating special: ${error}`,
	// 		});
	// 	});


};

export const searchSpecials = (req: Request, res: Response) => {
	const { id, media_type } = req.body.item as { id: number; media_type: 'movie' | 'tv'; };

	const data: (SpecialEpisode | Movie | null)[] = [];

	if (media_type === 'movie') {
		// await confDb.movie.findFirst({
		// 	where: {
		// 		id,
		// 	},
		// })
		// 	.then((d) => {
		// 		data.push(d);
		// 	});
	} else if (media_type === 'tv') {
		// await confDb.tv.findFirst({
		// 	where: {
		// 		id,
		// 	},
		// 	include: {
		// 		Episode: {
		// 			include: {
		// 				Tv: true,
		// 			},
		// 		},
		// 	},
		// }).then((d) => {
		// 	for (const episode of d?.Episode ?? []) {
		// 		data.push({
		// 			...episode,
		// 			Tv: {
		// 				show: episode.Tv.title!,
		// 				duration: episode.Tv.duration!,
		// 			},
		// 		});
		// 	};
		// });
	}

	return res.json(data);
};


interface SpecialEpisode extends Episode {
	Tv: Tv;
}
