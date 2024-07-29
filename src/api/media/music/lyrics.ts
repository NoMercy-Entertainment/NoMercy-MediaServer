import { Request, Response } from 'express-serve-static-core';

import { findLyrics } from '@server/providers';
import lyricsFinder from 'lyrics-finder';
import { tracks } from '@server/db/media/schema/tracks';
import { eq } from 'drizzle-orm';

export default async function(req: Request, res: Response) {
	let lyrics = '';
	let song: {
		id: string;
		name: string | null;
		created_at: string;
		updated_at: string;
		folder: string | null;
		cover: string | null;
		color_palette: string | null;
		blurHash: string | null;
		track: number | null;
		disc: number | null;
		date: string | null;
		filename: string | null;
		duration: string | null;
		quality: number | null;
		path: string | null;
		lyrics: string | null;
		folder_id: string;
		artist_track: {
			artist_id: string;
			track_id: string;
			artist: {
				id: string;
				name: string;
				created_at: string | number;
				updated_at: string | number;
				description: string | null;
				folder: string | null;
				cover: string | null;
				color_palette: string | null;
				blurHash: string | null;
				library_id: string;
			};
		}[];
	} | undefined;

	try {
		song = globalThis.mediaDb.query.tracks.findFirst({
			where: eq(tracks.id, req.body.id),
			with: {
				artist_track: {
					with: {
						artist: true,
					},
				},
				album_track: {
					with: {
						album: true,
					},
				},
			},
		});

		if (song && !song?.lyrics) {
			lyrics = await findLyrics(song);
			if (!lyrics) {
				lyrics = await lyricsFinder(song.artist_track?.[0]?.artist.name, song.name);
				song.lyrics = lyrics;
			}
		}

		if (song && lyrics) {
			globalThis.mediaDb.update(tracks)
				.set({
					lyrics,
				})
				.where(eq(tracks.id, song.id))
				.returning()
				.get();
		}

	} catch (error) {
		console.log(error);
	}

	if (lyrics == '' && !song?.lyrics) {
		return res.status(404)
			.json({
				message: 'No Lyrics found',
			});
	}

	try {
		return res.json({
			lyrics: JSON.parse(song?.lyrics ?? lyrics ?? '{}'),
		});
	} catch (error) {
		return res.json({
			lyrics: song?.lyrics ?? lyrics,
		});
	}
}
