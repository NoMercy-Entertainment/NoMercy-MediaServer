import { ExecException, exec } from 'child_process';
import {
	Stats,
	createWriteStream,
	mkdirSync,
	rmSync,
	statSync
} from 'fs';
import { ffmpeg, tempPath } from '../../state';
import { join, resolve as pathResolve } from 'path';

import {
	ISizeCalculationResult
} from 'image-size/dist/types/interface';
import Logger from '../../functions/logger';
import { PaletteColors } from 'types/server';
import axios from 'axios';
import colorPalette from '../../functions/colorPalette/colorPalette';
import createBlurHash from '../../functions/createBlurHash/createBlurHash';
import { randomUUID } from 'crypto';
import sizeOf from 'image-size';

export interface DownloadImage {
    dimensions: ISizeCalculationResult;
    stats: Stats;
	colorPalette: PaletteColors | null;
	blurHash: string | null;
}

export default (url: string, path: string, usableImageSizes?: {
    size: string;
    type: string[];
}[]| undefined): Promise<DownloadImage> => {

	Logger.log({
		name: 'image',
		message: `Downloading image: ${url}`,
		level: 'verbose',
	});

	return new Promise(async (resolve, reject) => {
		path = pathResolve(path);

		let tempName;
		if (path.includes('.svg')) {
			tempName = path;
		} else {
			tempName = join(tempPath, `${randomUUID()}.jpg`);
		}

		try {
			const size = await fetch(url, path, tempName);

			if (size == 0) {
				reject(new Error(''));
			}

			if (!path.includes('.svg')) {
				await convertImageToWebp(tempName, path, usableImageSizes);
			}

			const dimensions = sizeOf(path);
			const stats = statSync(path);

			let pallette: PaletteColors | null = null;
			try {
				pallette = await colorPalette(url);
			} catch (error) {
				//
			}

			let hash: string | null = null;
			try {
				hash = await createBlurHash(url);
			} catch (error) {
				//
			}

			resolve({
				dimensions: dimensions,
				stats: stats,
				colorPalette: pallette,
				blurHash: hash,
			});

		} catch (error) {
			reject(error);
		}
	});
};

export const fetch = (url: string, path: string, tempName: string): Promise<number> => {

	return new Promise(async (resolve, reject) => {

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
			.catch(error => reject(error));

			writer.on('finish', () => resolve(size));
			writer.on('error', reject);

			return size;

		} catch (error) {
			reject(error);
		}

		return size;
	});
};

export const convertImageToWebp = (input: string, output: string, usableImageSizes?: {
    size: string;
    type: string[];
}[] | undefined): Promise<void> => {

	return new Promise((resolve, reject): void => {

		const sizes = [`-quality 100 -pix_fmt yuva420p "${output}"`];

		if (usableImageSizes) {
			usableImageSizes.slice(1).map((s) => {
				sizes.push(`-quality 80 -pix_fmt yuva420p -vf "scale=${s.size.replace('w', '')}:-2" "${output.replace('original', s.size)}"`);
			});
		}

		exec(`${ffmpeg} -i "${input}" -y ${sizes.join(' ')}`, (error: ExecException | null) => {
			if (error) {
				console.log(error);
				return reject(error);
			}

			rmSync(input);
			resolve();
		});
	});
};
