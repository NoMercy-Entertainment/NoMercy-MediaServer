import { Request, Response } from "express";

import { KAuthRequest } from "types/keycloak";
import { confDb } from "../../../../database/config";
import { deviceId } from "../../../../functions/system";

export default async function (req: Request, res: Response) {
	try {
		const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

		const music = await confDb.playlist.findFirst({
			where: {
				id: req.params.id,
				userId: user,
			},
			include: {
				PlaylistTrack: {
					include: {
						Track: {
							include: {
								Artist: true,
								Album: true,
								FavoriteTrack: {
									where: {
										userId: user,
									},
								},
							},
						},
					},
					orderBy: {
						updated_at: "asc",
					},
				},
			},
		});

		if (music) {
			const result: any = {
				type: "playlist",
				...music,
				colorPalette: JSON.parse(music.colorPalette ?? "{}"),
				track: music.PlaylistTrack.map((t) => {
					return {
						...t.Track,
						cover: t.Track.Album[0].cover,
						type: "playlist",
						origin: deviceId,
						date: t.updated_at,
						favorite_track: t.Track.FavoriteTrack.length > 0,
						colorPalette: undefined,
						FavoriteTrack: undefined,
						album: {
							id: t.Track.Album[0]?.id ?? null,
							name: t.Track.Album[0]?.name ?? null,
							artistId: t.Track.Artist[0]?.id ?? null,
							cover: music.PlaylistTrack[0].Track.Album[0]?.cover ?? null,
							description: t.Track.Album[0]?.description ?? null,
						},
						artists: t.Track.Artist,
						artist: {
							id: t.Track.Artist[0]?.id ?? null,
							name: t.Track.Artist[0]?.name ?? null,
							artistId: t.Track.Artist[0]?.artistId ?? null,
							cover: music.PlaylistTrack[0].Track.Artist[0]?.cover ?? null,
							description: t.Track.Artist[0]?.description ?? null,
							folder: t.Track.Artist[0]?.folder ?? null,
						},
					};
				}),
			};

			delete result.playlistTrack;

			return res.json(result);
		} else {
			const lists = await confDb.playlist
				.findMany({
					where: {
						userId: user,
					},
				});

			const playlist = await confDb.playlist
				.create({
					data: {
						name: req.body.name ?? `My playlist ${lists.length + 1}`,
						description: "",
						userId: user,
					},
				});

			return res.status(400).json(playlist);
		}
	} catch (error) {
		console.log(error);
	}

	return res.json({});
}
