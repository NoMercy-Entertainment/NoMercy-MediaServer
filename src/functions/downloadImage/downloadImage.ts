import { Stats, createWriteStream, existsSync, mkdirSync } from 'fs';

import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { PaletteColors } from 'types/server';
import { WriteStream } from 'tty';
import axios from 'axios';
import colorPalette from '../../functions/colorPalette/colorPalette';
import { resolve as pathResolve } from 'path';
import sizeOf from 'image-size';
import { statSync } from "fs";

export interface DownloadImage {
    dimensions: ISizeCalculationResult;
    stats: Stats;
	colorPalette: PaletteColors | null;
}

export default async (url: string, path: string): Promise<DownloadImage> => {

	path = pathResolve(path);

	return new Promise(async (resolve, reject) => {

		try {
			await fetch(url, path);
			const dimensions = sizeOf(path);
			const stats = statSync(path);

			let pallette: PaletteColors | null = null
			try {
				pallette = await colorPalette(url);
			} catch (error) {
				reject(error);
			}
	
			resolve({
				dimensions: dimensions,
				stats: stats,
				colorPalette: pallette,
			})

		} catch (error) {
			reject(error);
		}
	});
};

const fetch = (url: string, path: string): Promise<void> => {
	
	return new Promise(async (resolve, reject): Promise<void> => {

		try {
			mkdirSync(path.replace(/(.+)[\\\/].+\.\w+$/u, '$1'), { recursive: true });

			const writer = createWriteStream(path, { mode: 0o777 });

			await axios.get(url, {
				method: 'GET',
				responseType: 'stream',
				timeout: 30000,
			})
			.then((response) => {
				response.data.pipe(writer);
			})
			.catch((error) => reject(error));
			
			writer.on('finish', resolve);
			writer.on('error', reject);

		} catch (error) {
			reject(error);
		}
	});
}