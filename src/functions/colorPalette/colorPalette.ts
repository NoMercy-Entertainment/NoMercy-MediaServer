import axios from 'axios';
import { readFileSync } from 'fs';
import colorThief from 'pure-color-thief-node';
import { PaletteColors } from '@server/types/server';

export default async (data: string| Buffer, type?: string): Promise<PaletteColors | null> => {

	try {
		let imageBuffer;
		if (typeof data == 'string') {
			imageBuffer = await axios
				.get(data, {
					responseType: 'arraybuffer',
				});
		} else {
			imageBuffer = data;
		}

		const img = new colorThief();

		if (!['image/png', 'image/jpeg', 'image/jpg'].includes(imageBuffer?.headers?.['content-type'] ?? type)) {
			return null;
		}

		await img.loadImage(Buffer.from(imageBuffer.data ?? data), imageBuffer?.headers?.['content-type'] ?? type);

		const pallette = img.getColorPalette(5);

		return {
			primary: `rgb(${pallette[0]})`,
			lightVibrant: `rgb(${pallette[1]})`,
			darkVibrant: `rgb(${pallette[2]})`,
			lightMuted: `rgb(${pallette[3]})`,
			darkMuted: `rgb(${pallette[4]})`,
		};

	} catch (error) {
		console.log(error);
		return null;
	}
};

export const colorPaletteFromFile = async (path: string): Promise<PaletteColors|null> => {

	const img = new colorThief();
	const file = path.replace(/[\\\/]undefined/gu, '');

	await img.loadImage(readFileSync(file), path.replace(/.*\.(\w{3,4})$/u, 'image/$1').replace('jpg', 'jpeg'));
	const palette = img.getColorPalette(5);

	return {
		primary: `rgb(${palette[0]})`,
		lightVibrant: `rgb(${palette[1]})`,
		darkVibrant: `rgb(${palette[2]})`,
		lightMuted: `rgb(${palette[3]})`,
		darkMuted: `rgb(${palette[4]})`,
	};
};
