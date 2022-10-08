import { Prisma } from "@prisma/client";
import { confDb } from "../../database/config";
import genres from "../../providers/tmdb/genres";

export default async function () {
	const genre = await genres();

	genre.map(async (g) => {
		const genreInsert = Prisma.validator<Prisma.GenreUncheckedCreateInput>()({
			id: g.id,
			name: g.name,
		});

		await confDb.genre.upsert({
			where: {
				id: g.id,
			},
			update: genreInsert,
			create: genreInsert,
		});
	});
}
