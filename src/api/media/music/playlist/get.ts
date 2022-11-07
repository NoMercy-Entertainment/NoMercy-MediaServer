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
					
					const albums = t.Track.Album.map(a => ({
						id: a.id,
						name: a?.name,
						folder: a?.folder,
						cover: a?.cover ?? t.Track.Artist[0]?.cover ?? t.Track.cover ?? null,
						description: a?.description,
						libraryId: t.Track.Artist[0].libraryId,
						origin: deviceId,
						colorPalette: undefined,
					}));
					const artists = t.Track.Artist.filter(a => a.name != 'Various Artists').map(a => ({
						id: a.id,
						name: a.name,
						cover: a.cover ?? t.Track.cover ?? t.Track.cover ?? null,
						description: a.description,
						folder: a.folder,
						libraryId: a.libraryId,
						origin: deviceId,
						colorPalette: undefined,
					}));

					return {
						...t.Track,
						type: 'artist',
						artistId: artists[0].id,
						origin: deviceId,
						artists: artists,
						cover: albums[0]?.cover ?? t.Track.cover ?? null,
						folder: albums[0]?.folder ?? t.Track.folder,
						Artist: undefined,
						Album: undefined,
						FavoriteTrack: undefined,
						libraryId: t.Track.Artist[0].libraryId,
						colorPalette: undefined,
						album: albums[0],
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
