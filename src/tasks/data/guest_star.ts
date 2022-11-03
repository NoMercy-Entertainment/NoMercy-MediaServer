import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { Prisma } from '@prisma/client'
import { confDb } from '../../database/config';
import { unique } from '../../functions/stringArray';

export default async (
	episode: EpisodeAppend,
	transaction: Prisma.PromiseReturnType<any>[],
	guestStarArray: Prisma.CastEpisodeCreateOrConnectWithoutEpisodeInput[],
	people: number[]
) => {
	for (const guest_star of unique(episode.credits.guest_stars, 'credit_id')) {
		if(!people.includes(guest_star.id)) continue;

		const guestStarInsert = Prisma.validator<Prisma.GuestStarUncheckedCreateInput>()({
			id: guest_star.credit_id,
			personId: guest_star.id,
			adult: guest_star.adult,
			character: guest_star.character,
			creditId: guest_star.credit_id,
			gender: guest_star.gender,
			knownForDepartment: guest_star.known_for_department,
			name: guest_star.name,
			order: guest_star.order,
			originalName: guest_star.original_name,
			popularity: guest_star.popularity,
			profilePath: guest_star.profile_path,
			episodeId: episode.id,
		});

		transaction.push(
			confDb.guestStar.upsert({
				where: {
					creditId: guest_star.credit_id,
				},
				update: guestStarInsert,
				create: guestStarInsert,
			})
		);

		guestStarArray.push({
			where: {
				creditId: guest_star.credit_id,
			},
			create: {
				creditId: guest_star.credit_id,
			},
		});
	}
};
