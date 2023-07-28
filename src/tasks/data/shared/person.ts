
import Logger from '@server/functions/logger/logger';
import { image } from './image';
import translation from './translation';
import { insertPeople } from '@server/db/media/actions/people';
import { CompleteTvAggregate } from '../tv/fetchTvShow';
import { CompleteMovieAggregate } from '../movie/fetchMovie';

export default (
	req: CompleteTvAggregate | CompleteMovieAggregate,
	transaction: any[]
) => {
	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding people for: ${(req as CompleteTvAggregate).name ?? (req as CompleteMovieAggregate).title}`,
	});

	for (let i = 0; i < req.people.length; i++) {
		const person = req.people[i];

		try {
			insertPeople({
				id: person.id,
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
				placeOfBirth: person.place_of_birth,
				popularity: person.popularity,
				profile: person.profile_path,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['person', error]),
			});
		}

		translation(person, transaction, 'person');
		image(person, transaction, 'profile', 'person');

	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `People for: ${(req as CompleteTvAggregate).name ?? (req as CompleteMovieAggregate).title} added successfully`,
	});
};
