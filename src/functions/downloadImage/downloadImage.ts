import { PathLike, Stats, createWriteStream, existsSync, mkdirSync } from 'fs';

import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { PaletteColors } from 'types/server';
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

			let pallete: PaletteColors | null = null
			try {
				pallete = await colorPalette(url);
			} catch (error) {
				
			}
	
			resolve({
				dimensions: dimensions,
				stats: stats,
				colorPalette: pallete,
			})

		} catch (error) {
			reject(error);
		}
	});
};

const fetch = (url: string, path: string): Promise<void> => {
	
	return new Promise(async (resolve, reject): Promise<void> => {

		if(existsSync(path)) return resolve();

		mkdirSync(path.replace(/[\\\/][\w\d_-]+\.\w+$/u, ''), { recursive: true });
		
		const writer = createWriteStream(path, { mode: 777});

		await axios({
			url,
			method: 'GET',
			responseType: 'stream',
		})
		.then((response) => response.data.pipe(writer))
		.catch(() => reject);

		writer.on('finish', resolve);
		writer.on('error', reject);
	});
}