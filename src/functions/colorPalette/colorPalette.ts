import { PaletteColors } from "types/server";
import axios from "axios";
import colorThief from "pure-color-thief-node";

export default async (url: string): Promise<PaletteColors> => {
	const imageBuffer = await axios
		.get(url, {
			responseType: "arraybuffer",
		})
		.then((response) => Buffer.from(response.data, "binary"));

	const img = new colorThief();

	return img.loadImage(imageBuffer).then(() => {
		const pallete = img.getColorPalette(5);

		return {
			primary: `rgb(${pallete[0]})`,
			lightVibrant: `rgb(${pallete[1]})`,
			darkVibrant: `rgb(${pallete[2]})`,
			lightMuted: `rgb(${pallete[3]})`,
			darkMuted: `rgb(${pallete[4]})`,
		};
	});
};
