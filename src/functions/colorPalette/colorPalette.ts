import { PaletteColors } from "types/server";
import axios from "axios";
import colorThief from "pure-color-thief-node";
import { readFileSync } from "fs";

export default async (url: string): Promise<PaletteColors> => {
	const imageBuffer = await axios
		.get(url, {
			responseType: "arraybuffer",
		});

	const img = new colorThief();

	await img.loadImage(Buffer.from(imageBuffer.data), imageBuffer.headers['content-type']);

	const pallete = img.getColorPalette(5);

	return {
		primary: `rgb(${pallete[0]})`,
		lightVibrant: `rgb(${pallete[1]})`,
		darkVibrant: `rgb(${pallete[2]})`,
		lightMuted: `rgb(${pallete[3]})`,
		darkMuted: `rgb(${pallete[4]})`,
	};
};

export const colorPaletteFromFile = async (path: string): Promise<PaletteColors|null> => {
	
	const img = new colorThief();

	await img.loadImage(readFileSync(path.replace(/[\\\/]undefined/gu,'')), path.replace(/.*\.(\w{3,4})$/, 'image/$1').replace('jpg', 'jpeg'));
	const palette = img.getColorPalette(5);

	return {
		primary: `rgb(${palette[0]})`,
		lightVibrant: `rgb(${palette[1]})`,
		darkVibrant: `rgb(${palette[2]})`,
		lightMuted: `rgb(${palette[3]})`,
		darkMuted: `rgb(${palette[4]})`,
	};
};
