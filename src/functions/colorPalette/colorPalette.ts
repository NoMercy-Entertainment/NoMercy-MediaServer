import { getPaletteFromURL } from 'color-thief-node';
import { PaletteColors } from 'types/server';

export default async (url: string): Promise<PaletteColors> => {

    return getPaletteFromURL(url, 1, 10)
        .then(pallete => {
            return {
                primary: `rgb(${pallete[0]})`,
                lightVibrant: `rgb(${pallete[1]})`,
                darkVibrant: `rgb(${pallete[2]})`,
                lightMuted: `rgb(${pallete[3]})`,
                darkMuted: `rgb(${pallete[4]})`,
            }
        });
};
