import Logger from '@server/functions/logger/logger';
import { insertPeople } from '@server/db/media/actions/people';
import { CompleteTvAggregate } from '../tv/fetchTvShow';
import { CompleteMovieAggregate } from '../movie/fetchMovie';
import colorPalette from '@server/functions/colorPalette';
import { image } from './image';
import translation from './translation';

export default async (
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

		const palette = person.profile_path
			?			JSON.stringify(await colorPalette(`https://image.tmdb.org/t/p/w185${person.profile_path}`))
			:			undefined;

		try {
			insertPeople({
				id: person.id,
				adult: person.adult,
				alsoKnownAs: person.also_known_as == null
					?					''
					:					person.also_known_as.join?.(','),
				biography: person.biography,
				birthday: person.birthday,
				deathDay: person.deathDay,
				gender: person.gender,
				homepage: person.homepage,
				imdbId: person.imdb_id,
				knownForDepartment: person.known_for_department,
				name: person.name,
				placeOfBirth: person.place_of_birth,
				popularity: person.popularity,
				profile: person.profile_path,
				color_palette: palette,
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
		image(person, 'profile', 'person');

	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `People for: ${(req as CompleteTvAggregate).name ?? (req as CompleteMovieAggregate).title} added successfully`,
	});
};
