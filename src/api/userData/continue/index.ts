import { Movie, Tv } from "@prisma/client";
import { Request, Response } from "express";
import { sortBy, unique } from "../../../functions/stringArray";

import { KAuthRequest } from "types/keycloak";
import { confDb } from "../../../database/config";
import { createTitleSort } from "../../../tasks/files/filenameParser";

export default async function (req: Request, res: Response) {
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	const userData = await confDb.userData.findMany({
		where: {
			sub_id: user,
			NOT: {
				time: null,
			},
		},
		orderBy: {
			updatedAt: "desc",
		},
	});

	const userDataTvs = unique(
		userData.filter((u) => u.tvId),
		"tvId"
	);
	const userDataMovies = unique(
		userData.filter((u) => u.movieId),
		"movieId"
	);

	const items: any = [];

	await Promise.all([
		confDb.tv
			.findMany({
				where: {
					id: {
						in: userDataTvs.map((u) => u.tvId!) ?? [],
					},
				},
			})
			.then((data) => items.push(...data)),

		confDb.movie
			.findMany({
				where: {
					id: {
						in: userDataMovies.map((u) => u.movieId!) ?? [],
					},
				},
			})
			.then((data) => items.push(...data)),
	]);

	const newArray = sortBy(userDataTvs.concat(userDataMovies), "updatedAt", "desc").map((d) => ({
		...items.find((n) => (d.tvId ?? d.movieId) == n.id),
		time: d.updatedAt,
	}));

	const data = newArray.map((d: Tv | Movie) => ({
		id: d.id,
		mediaType: (d as Tv).mediaType ?? 'movie',
		poster: d.poster,
		title: d.title[0].toUpperCase() + d.title.slice(1),
		titleSort: createTitleSort(d.title),
		type: (d as Tv).mediaType ? "tv" : "movies",
		updatedAt: d.updatedAt,
		blurHash: d.blurHash ? JSON.parse(d.blurHash) : null,
	}));

	return res.json(data);
}
