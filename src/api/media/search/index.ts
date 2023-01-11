import { Movie, Tv } from "@prisma/client";
import { Request, Response } from "express";
import { groupBy, matchPercentage, sortBy } from "../../../functions/stringArray";

import { confDb } from "../../../database/config";
import { createTitleSort } from "../../../tasks/files/filenameParser";
import { parseTitleAndYear } from "../../../functions/videoFilenameParser";
import { parseYear } from "../../../functions/dateTime";
import searchVideo from './searchVideo';

export default async function (req: Request, res: Response) {

	const { query }: { query: string } = req.body;

	if(!query || query.length < 3) {
		return res.json({
			status: 'error',
			message: 'You need to provide at least 3 characters'
		});
	}

	const { title, year } = parseTitleAndYear(query);

    const video = await searchVideo(query);
    const {movie, tv, person} = groupBy(video, 'media_type');

    const music = [];

    const TV: Tv[] = []; 
    const MOVIE: Movie[] = []; 

    await Promise.all([
        confDb.tv.findMany({
            where: {
                id: {
                    in: tv?.map((t: { id: any; }) => t.id) ?? []
                }
            }
        }).then((data) => TV.push(...data)),
        confDb.movie.findMany({
            where: {
                id: {
                    in: movie?.map((m: { id: any; }) => m.id) ?? []
                }
            }
        }).then((data) => MOVIE.push(...data)),
    ]);

    const data: any[] = [
        ...(movie?.map((m) => {
            const item = MOVIE.find(M => M.id == m.id);
            return {
                ...m, 
                have: !!item,
                titleSort: createTitleSort(item?.title ?? m.title),
                year: parseYear(item?.releaseDate ?? m.release_date),
                match: m.title.toLowerCase().startsWith(title.toLowerCase()),
                matchPercentage: matchPercentage(title.toLowerCase(), item?.title.toLowerCase() ?? m.title.toLowerCase()),
            }
        }) ?? []),
        ...(tv?.map((t) => {
            const item = TV.find(T => T.id == t.id);
            return {
                ...t, 
                have: item?.haveEpisodes, 
                total: item?.numberOfEpisodes,
                titleSort: createTitleSort(item?.title ?? t.name),
                year: parseYear(item?.firstAirDate ?? t.first_air_date),
                match: t.name.toLowerCase().startsWith(title.toLowerCase()),
                matchPercentage: matchPercentage(title.toLowerCase(), item?.title.toLowerCase() ?? t.name.toLowerCase()),
            }
        }) ?? [])
    ];
	
    // console.log(data);

	return res.json({
        video: sortBy(data, 'matchPercentage', 'desc'),
        person,
        music
    });

}