import axios from 'axios';
import { exec, ExecException } from 'child_process';
import { randomUUID } from 'crypto';
import { createWriteStream, mkdirSync, PathLike, readFileSync, rmSync, Stats, statSync } from 'fs';
import sizeOf from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { join, resolve as pathResolve } from 'path';
import { PaletteColors } from 'types/server';

import Logger from '../../functions/logger';
import { ffmpeg, tempPath } from '../../state';
import colorPalette from '../colorPalette';
import createBlurHash from '../createBlurHash';

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

	Logger.log({
		name: 'image',
		message: `Downloading image: ${url}`,
		level: 'verbose',
	});

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
			if (!only || only.includes('blurHash')) {
				try {
					hash = await createBlurHash(buffer);
				} catch (error) {
					//
				}
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

export const fetch = (url: string, path: string, tempName: string): Promise<{ size: number; type: string; }> => {

	return new Promise(async (resolve, reject) => {

		let size = 0;
		let type = '';

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
