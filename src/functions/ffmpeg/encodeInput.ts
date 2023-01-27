import { AppState, useSelector } from '../../state/redux';

import { EP } from 'tasks/files/filenameParser';
import { Store } from '../../functions/ffmpeg/store';
import { confDb } from '../../database/config';
import { resolve } from 'path';

export const encodeInput = async ({ id }: {id:number}) => {

	const queue = useSelector((state: AppState) => state.config.queueWorker);

    const episodes = await confDb.episode.findMany({
        where: {
            tvId: id,
            File: {
                some: {
                    extension: '.mkv',
                },
            },
        },
        include: {
            Tv: true,
            Season: true,
            File: {
                include: {
                    Library: {
                        include: {
                            Folders: {
                                include: {
                                    folder: true,
                                },
                            },
                            EncoderProfiles: {
                                include: {
                                    EncoderProfile: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    for (const episode of episodes) {

        // await encodeEpisode({ episode });

        await queue.add({
            file: resolve(__dirname, 'encodeInput'),
            fn: 'encodeEpisode',
            args: episode,
        });
    }

    return episodes;
};

export const encodeEpisode = async (episode) => {

    const onDemand = new Store();

    await onDemand.fromDatabase(episode as unknown as EP);

    onDemand
        .makeStack()
        .start()
        .buildSprite();
};
