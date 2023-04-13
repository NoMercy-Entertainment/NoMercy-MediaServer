import { confDb } from '../../database/config';
import { Prisma } from '../../database/config/client';
import Logger from '../../functions/logger/logger';
import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { image } from './image';
import translation from './translation';

export default async (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[]
) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding people for: ${(req as CompleteTvAggregate).name ?? (req as CompleteMovieAggregate).title}`,
	});
	for (let i = 0; i < req.people.length; i++) {
		const person = req.people[i];

		const personInsert = Prisma.validator<Prisma.PersonUncheckedCreateInput>()({
			adult: person.adult,
			alsoKnownAs: person.also_known_as == null
				? ''
				: person.also_known_as.join?.(','),
			biography: person.biography,
			birthday: person.birthday,
			deathday: person.deathday,
			gender: person.gender,
			homepage: person.homepage,
			imdbId: person.imdb_id,
			knownForDepartment: person.known_for_department,
			name: person.name,
			id: person.id,
			placeOfBirth: person.place_of_birth,
			popularity: person.popularity,
			profile: person.profile_path,
		});

		transaction.push(
			confDb.person.upsert({
				where: {
					id: person.id,
				},
				update: personInsert,
				create: personInsert,
			})
		);

		translation(person, transaction, 'person');
		await image(person, transaction, 'profile', 'person');
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `People for: ${(req as CompleteTvAggregate).name ?? (req as CompleteMovieAggregate).title} added successfully`,
	});
};
