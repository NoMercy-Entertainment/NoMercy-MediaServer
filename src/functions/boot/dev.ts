// import { selectLibraryWithRelations } from '@server/db/media/actions/libraries';

//
// import { tracks } from '@server/db/media/schema/tracks';
// import { inArray } from 'drizzle-orm';
// import { rmSync } from 'fs';


// import { mkdirSync, readdirSync, renameSync } from 'fs';
// import { parseYear } from '../dateTime';

// import { insertLibraryMovie } from '@server/db/media/actions/library_movie';


export default () => {

	// const peoples = globalThis.mediaDb.query.people.findMany({
	// 	where: (table) => isNull(table.titleSort),
	// 	// with: {
	// 	// 	person_track: true,
	// 	// },
	// });

	// for (const [index, artist] of chunk(people, 10).entries()) {
	// 	mediaDb.delete(people)
	// 		.where(inArray(people.id, artist.map(a => a.id)))
	// 		.run();

	// 	process.stdout.write(`Deleted ${index * 10} of ${people.length} people, ${Math.round((index * 10 / people.length) * 100)}%\r`);
	// }
	// for (const [index, person] of peoples.entries()) {
	// 	mediaDb.update(people)
	// 		.set({
	// 			titleSort: createTitleSort(person.name as string),
	// 		})
	// 		.where(eq(people.id, person.id))
	// 		.run();

	// 	process.stdout.write(`Updated ${index} of ${peoples.length} people, ${Math.round((index / peoples.length) * 100)}%\r`);
	// }
};
