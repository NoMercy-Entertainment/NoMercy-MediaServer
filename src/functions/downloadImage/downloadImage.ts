import { ExecException, exec } from 'child_process';
import {
  Stats,
  createWriteStream,
  mkdirSync,
  rmSync,
} from 'fs';
import { ffmpeg, tempPath } from '../../state';
import { join, resolve as pathResolve } from 'path';

import {
  ISizeCalculationResult,
} from 'image-size/dist/types/interface';
import { PaletteColors } from 'types/server';
import axios from 'axios';
import colorPalette from '../../functions/colorPalette/colorPalette';
import { randomUUID } from 'crypto';
import sizeOf from 'image-size';
import { statSync } from 'fs';

export interface DownloadImage {
    dimensions: ISizeCalculationResult;
    stats: Stats;
	colorPalette: PaletteColors | null;
}

export default async (url: string, path: string): Promise<DownloadImage> => {

	return new Promise(async (resolve, reject) => {
		path = pathResolve(path);

		let tempName;
		if(!path.includes('.svg')){
			tempName = join(tempPath, `${randomUUID()}.jpg`);	
		} else {
			tempName = path;	
		}

		try {
			const size = await fetch(url, path, tempName);

			if(size == 0) {
				reject();
			}

			if(!path.includes('.svg')){
				await convertImageToWebp(tempName, path);
			}

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

const fetch = (url: string, path: string, tempName: string): Promise<number> => {

	return new Promise(async (resolve, reject): Promise<number> => {

		let size = 0;
		try {
			mkdirSync(path.replace(/(.+)[\\\/].+\.\w+$/u, '$1'), { recursive: true });

			const writer = createWriteStream(tempName, { mode: 0o777 });
			await axios.get(url, {
				method: 'GET',
				responseType: 'stream',
				timeout: 30000,
			})
			.then((response) => {
				size = parseInt(response?.headers?.['content-length'] ?? '0', 10);
				response.data.pipe(writer);
			})
			.catch((error) => reject(error));
			
			writer.on('finish', () => resolve(size));
			writer.on('error', reject);

			return size;

		} catch (error) {
			reject(error);
		}
		
		return size;
	});
}

const convertImageToWebp = (input: string, output: string): Promise<void> => {
	
	return new Promise((resolve, reject): void => {
		exec(`${ffmpeg} -i ${input} -quality 80 -pix_fmt yuva420p ${output}`, (error: ExecException | null, stdout: string, stderr: string) => {
			if(error){
				console.log(error)
				return reject(error);
			}
			
			rmSync(input);
			resolve();
		});
	});
}