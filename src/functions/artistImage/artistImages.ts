import { existsSync, readFileSync, writeFileSync } from 'fs';

import { PaletteColors } from 'types/server';
import axios from 'axios';
import { cachePath } from '@/state';
import colorPalette from '../colorPalette';
import { confDb } from '../../database/config';
import downloadImage from '../downloadImage';
import { jsonToString } from '../stringArray';
import { load } from 'cheerio';

export interface Urls {
	page: string;
	url: string;
	up: number;
	down: number;
	average: number;
	type: string;
}

export const artistImages = async (artist: string) => {
	const baseUrl = 'https://www.last.fm';
	const sanitizedName = artist
		.replace(/[\s]/gu, '+')
		.replace(/[áÁåä]/giu, 'a')
		.replace(/[ç]/giu, 'c')
		.replace(/[éëèê]/giu, 'e')
		.replace(/[íîï]/giu, 'i')
		.replace(/[Øöó]/giu, 'o')
		.replace(/[ý]/giu, 'y')
		.replace(/[®*]/giu, '');

	const tempFile = `${cachePath}/temp/${sanitizedName}.json`;

	if (existsSync(tempFile)) {
		return JSON.parse(readFileSync(tempFile, 'utf8')).filter(r => r.palette);
	}

	const url = `${baseUrl}/music/${sanitizedName}/+images`;

	const urls: Urls[] = [];

	const promises: any[] = [];

	const fetchImageList = async (baseUrl: string, path?: string) => {
		await axios
			.get<any>(baseUrl + (path ?? ''), { timeout: 5000 })
			.then(async ({ data }) => {
				const $ = load(data);
				$('.image-list')
					.children()
					.each((i, el) => {
						const item: any = $(el).children()
							.closest('a')
							.attr('href');

						urls.push({
							page: baseUrl + (path ?? ''),
							url: `https://lastfm.freetls.fastly.net/i/u/avatar300s/${item.replace(/.*\//u, '')}.png`,
							up: 0,
							down: 0,
							average: 0,
							type: 'unknown',
						});
					});

				if ($('.pagination-next')) {
					const nextPageUrl = $('.pagination-next').children()
						.closest('a')
						.attr('href')!;

					if (nextPageUrl) {
						await fetchImageList(baseUrl, nextPageUrl);
					}
				}
			});
	};

	try {
		await fetchImageList(url)
			.then(() => {
				for (let i = 0; i < urls.length; i += 1) {
					promises.push(
						axios
							.get<any>(urls[i].page, { timeout: 5000 })
							.then(async ({ data }) => {
								const $ = load(data);

								$('.gallery-image-votes').each((j, el) => {
									const a = $(el).find('span');
									const b = a.parent().contents();
									const text = parseInt(
										$(b[Array.prototype.findIndex.call(b, elem => $(elem).is(a)) + 1])
											.text()
											.trim(),
										10
									);
									const direction = a.text();

									if (direction.includes('Up')) {
										urls[i].up = text;
									} else if (direction.includes('Down')) {
										urls[i].down = text;
									}
								});

								try {
									const res = await axios.head(urls[i].url, { timeout: 5000 });
									urls[i].type = res.headers['content-type'] as string;
									urls[i].average = (urls[i].up / (urls[i].down + urls[i].up)) * 100;
								} catch (error) {
									//
								}
							})
							.catch(() => {
								// console.log(error);
								null;
							})
					);
				}
			})
			.catch(() => {
				// console.log(error);
				null;
			});

		await Promise.all(promises)
			.catch(() => {
				// console.log(error);
				null;
			});
	} catch {
		//
	}

	// const result = urls
	// 	.filter(a => !!a.type)
	// 	.filter(async u => (await axios
	// 		.head<any>(u.url, { timeout: 5000 })
	// 		.catch(() => ({ status: 500 }))
	// 	).status < 400)
	// 	.filter(a => !a.type.includes('gif'))
	// 	.filter(a => a.average > 40)
	// 	.sort((a, b) => b.up - a.up)
	// 	.concat(
	// 		urls
	// 			.filter(a => a.average <= 40)
	// 			.filter(a => !a.type.includes('gif'))
	// 			.sort((a, b) => b.up - a.up)
	// 	)
	// 	.concat(urls.filter(a => a.type.includes('gif')).sort((a, b) => b.average - a.average));


	const promises2: any[] = [];
	const response: any[] = [];

	for (const url of urls) {
		promises2.push(async () => {
			response.push({
				...url,
				palette: await colorPalette(url.url),
			});
		});
	}

	await Promise.all(promises2.map(r => r()));

	writeFileSync(tempFile, JSON.stringify(response.filter(r => !!r.palette), null, 2));

	return response.filter(r => !!r.palette);
};

export const storageArtistImageInDatabase = async function (id: string, colorPalette: PaletteColors | null) {

	const artist = await confDb.artist.findFirst({
		where: {
			id: id,
		},
	});
	if (!artist?.id) {
		return;
	}

	await confDb.artist.update({
		where: {
			id: artist.id,
		},
		data: {
			colorPalette: colorPalette
				? jsonToString(colorPalette)
				: undefined,
		},
	});
};

export const getBestArtistImag = async function (artist: string, storagePath: string) {
	const image = (await artistImages(artist))[0];

	let result: boolean | null = false;
	let extension: string | null = '';

	if (image) {
		extension = image.type.replace('image/', '').replace('jpeg', 'jpg')
			.replace('unknown', 'png');
		await downloadImage({ url: image.url, path: `${storagePath}.${extension}`.replace('undefined', 'png') })
			.then(() => (result = true))
			.catch(() => {
				//
			});
	}

	return result
		? {
			path: `${storagePath}.${extension}`.replace(/[\\\/]undefined/gu, '').replace('undefined', 'png'),
			extension: extension,
			url: image.url,
		}
		: null;
};
