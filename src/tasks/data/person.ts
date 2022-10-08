import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import image from './image';

export default async (tv: CompleteTvAggregate | CompleteMovieAggregate, transaction: Prisma.PromiseReturnType<any>[]) => {
	for (let i = 0; i < tv.people.length; i++) {
		const person = tv.people[i];

		const personInsert = Prisma.validator<Prisma.PersonUncheckedCreateInput>()({
			adult: person.adult,
			alsoKnownAs: person.also_known_as == null ? '' : person.also_known_as.join?.(','),
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
			profilePath: person.profile_path,
		});

		// transaction.push(
		await	confDb.person.upsert({
				where: {
					id: person.id,
				},
				update: personInsert,
				create: personInsert,
			})
		// );		

		await image(person, transaction, 'profile', 'person');
	}
};
