import { ExecException, exec } from 'child_process';
import { PathLike, Stats, createWriteStream, mkdirSync, readFileSync, rmSync, statSync } from 'fs';
import { ffmpeg, tempPath } from '@server/state';
import { join, resolve as pathResolve } from 'path';

import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { PaletteColors } from '@server/types/server';
import axios from 'axios';
import colorPalette from '../colorPalette';
import { randomUUID } from 'crypto';
import sizeOf from 'image-size';

export interface DownloadImage {
    dimensions: ISizeCalculationResult;
    stats: Stats;
	colorPalette: PaletteColors | null;
	blurHash: string | null;
}

export default ({ url, path, only, usableImageSizes }: {
	url: string,
	path: string,
	only?: Array<'colorPalette' | 'blurHash'>,
	usableImageSizes?: {
		size: string;
		type: string[];
	}[]| undefined,
}): Promise<DownloadImage> => {

	// Logger.log({
	// 	name: 'image',
	// 	message: `Downloading image: ${url}`,
	// 	level: 'info',
	// 	color: 'green',
	// });

	return new Promise(async (resolve, reject) => {
		if (!path) {
			reject(new Error('Path empty'));
		}

		try {
			path = pathResolve(path);

			let tempName: number | PathLike;
			if (path.includes('.svg')) {
				tempName = path;
			} else {
				tempName = join(tempPath, `${randomUUID()}.jpg`);
			}

			const { size, type } = await fetch(url, path, tempName);

			if (size == 0) {
				reject(new Error('size is 0'));
			}

			const buffer = readFileSync(tempName);

			if (!path.includes('.svg')) {
				await convertImageToWebp(tempName, path, usableImageSizes);
			}

			const stats = statSync(path);
			const dimensions = sizeOf(buffer);

			let pallette: PaletteColors | null = null;
			if (!only || only.includes('colorPalette')) {
				try {
					pallette = await colorPalette(buffer, type);
				} catch (error) {
					//
				}
			}

			let hash: string | null = null;
			// if (!only || only.includes('blurHash')) {
			// 	try {
			// 		hash = await createBlurHash(buffer);
			// 	} catch (error) {
			// 		//
			// 	}
			// }
			// const now4 = Date.now();
			// Logger.log({
			// 	name: 'image',
			// 	message: `Created blurhash in ${now4 - now3}ms`,
			// 	level: 'info',
			// 	color: 'green',
			// });

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

export const fetch = (url: string, path: string, tempName: string): Promise<{ size: number; type: string; }> => {

	return new Promise(async (resolve, reject) => {

		let size = 0;
		let type = '';

		try {
			// console.log(url);
			mkdirSync(path.replace(/(.+)[\\\/].+\.\w+$/u, '$1'), { recursive: true });

			const writer = createWriteStream(tempName, { mode: 0o777 });
			await axios.get(url, {
				method: 'GET',
				responseType: 'stream',
				timeout: 3000,
			})
				.then((response) => {
					size = parseInt(response?.headers?.['content-length'] ?? '0', 10);
					type = response?.headers?.['content-type'] ?? null;
					response.data.pipe(writer);
				})
				.catch(error => reject(error));

			writer.on('finish', () => resolve({ size, type }));
			writer.on('error', reject);

			return size;

		} catch (error) {
			reject(error);
		}

		return {
			size,
			type,
		};
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

		const command = `${ffmpeg} -i "${input}" -y ${sizes.join(' ')}`;

		exec(command, (error: ExecException | null) => {
			if (error) {
				console.log(error);
				return reject(error);
			}

			rmSync(input);
			resolve();
		});
	});
};
