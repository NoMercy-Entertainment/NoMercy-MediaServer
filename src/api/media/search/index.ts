import { Request, Response } from "express";

import i18n from "../../../loaders/i18n";
import { parseTitleAndYear } from "../../../functions/videoFilenameParser";
import { searchMulti } from "../../../providers/tmdb/search";

export const search = async (req: Request, res: Response) => {
	await i18n.changeLanguage('en');

    if(!req.body.query){
        return res.json({
            status: "error",
            message: `No query provided`,
        });
    }
    
	const { title, year } = parseTitleAndYear(req.body.query);

    const data = await searchMulti(title, year);

    return res.json(data);

}