import { Prisma } from '../../database/config/client';
import { unique } from '../../functions/stringArray';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { downloadAndHash } from './image';

export default async(
	episode: EpisodeAppend,
	guestStarArray: Prisma.GuestStarCreateOrConnectWithoutEpisodeInput[],
	people: number[]
) => {
	for (const guest_star of unique(episode.credits.guest_stars, 'credit_id')) {
		if (!people.includes(guest_star.id)) continue;

		guestStarArray.push({
			where: {
				id: guest_star.id,
			},
			create: {
				personId: guest_star.id,
				Roles: {
					connectOrCreate: {
						where: {
							castId_guestId: {
								castId: guest_star.id,
								guestId: episode.id,
							},
						},
						create: {
							castId: guest_star.id,
							creditId: guest_star.credit_id,
							character: guest_star.character,
						},
					},
				},
			},
		});

		if (guest_star.profile_path) {
			await downloadAndHash({
				src: guest_star.profile_path,
				table: 'person',
				column: 'profile',
				type: 'profile',
				only: ['colorPalette', 'blurHash'],
			});
		}
	}
};
