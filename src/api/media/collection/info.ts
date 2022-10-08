import { Request, Response } from 'express';
import collection from '../../../providers/tmdb/collection/index';

export default async function (req: Request, res: Response) {

    collection(parseInt(req.params.id, 10))
        .then((data) => {
            return res.json({
                ...data,
            });
        });
}