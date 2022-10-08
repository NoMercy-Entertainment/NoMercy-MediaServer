import { confDb } from "../../../database/config";
import { Request, Response } from "express";
import { KAuthRequest } from "types/keycloak";
import { VideoFile } from "@prisma/client";

export default async function (req: Request, res: Response) {
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
    const { id, type, value } = req.body;

    let data: VideoFile = <VideoFile>{};

    if(type == 'tv') {
        data = (await confDb.tv.findFirst({
            where: {
                id: id,
            },
            include: {
                Episode: {
                    include: {
                        VideoFile: true
                    }
                }
            }
        }))?.Episode?.find(e => e.seasonNumber == 1 && e.episodeNumber == 1)?.VideoFile?.[0]!;
    }
    else if(type == 'movies') {
        data = (await confDb.movie.findFirst({
            where: {
                id: id,
            },
            include: {
                VideoFile: true
            }
        }))?.VideoFile?.[0]!;
    }

    confDb.userData.upsert({
        where: type == 'tv' ? {
            tvId_videoFileId_sub_id: {
                tvId: parseInt(id, 10),
                sub_id: user,
                videoFileId: data.id,
            }
        } : {
            movieId_videoFileId_sub_id: {
                movieId: parseInt(id, 10),
                sub_id: user,
                videoFileId: data.id,
            }
            
        },
        create: {
            tvId: type == 'tv' ? id : undefined,
            movieId: type == 'movies' ? id : undefined,
            sub_id: user,
            isFavorite: value,
            videoFileId: data.id,
        },
        update: {
            tvId: type == 'tv' ? id : undefined,
            movieId: type == 'movies' ? id : undefined,
            sub_id: user,
            isFavorite: value,
            videoFileId: data.id,
        }
    })
    .then((data) => {
        return res.json({
            success: true,
            data: data,
            message: `Item ${value ? 'added to' : 'removed from'} favorites`,
        })
    })
    .catch((error) => {
        return res.status(400).json({
            success: true,
            error: error,
            message: `Failed to ${value ? 'add item to' : 'remove item from'} favorites`,
        });
    })


}