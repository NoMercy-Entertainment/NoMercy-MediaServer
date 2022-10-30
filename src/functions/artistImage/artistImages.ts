import axios from "axios";
import { confDb } from "../../database/config";
import fs from "fs";
import { load } from "cheerio";

export interface Urls {
	page: string;
	url: string;
	up: number;
	down: number;
	average: number;
	type: string;
}

export const artistImages = async (artist: string) => {
	const baseUrl = "https://www.last.fm";

	const url = `${baseUrl}/music/${artist
		.replace(/[\s]/gu, "+")
		.replace(/[áÁåä]/giu, "a")
		.replace(/[ç]/giu, "c")
		.replace(/[éëèê]/giu, "e")
		.replace(/[íîï]/giu, "i")
		.replace(/[Øöó]/giu, "o")
		.replace(/[ý]/giu, "y")
		.replace(/[®]/giu, "")}/+images`;

	const urls: Urls[] = [];

	const promisses: any[] = [];

	try {
		await axios
			.get<any>(url, { timeout: 2000 })
			.then(({ data }) => {
				const $ = load(data);
				$(".image-list")
					.children()
					.each((i, el) => {
						const item: any = $(el).children().closest("a").attr("href");
						urls.push({
							page: `${baseUrl}${item}`,
							url: `https://lastfm.freetls.fastly.net/i/u/avatar300s/${item.replace(/.*\//u, "")}`,
							up: 0,
							down: 0,
							average: 0,
							type: "unknown",
						});
					});
			})
			.catch(() => {
				//
			})
			.then(() => {
				for (let i = 0; i < urls.length; i += 1) {
					promisses.push(
						axios
							.get<any>(urls[i].page, { timeout: 2000 })
							.then(async ({ data }) => {
								const $ = load(data);

								$(".gallery-image-votes").each((j, el) => {
									const a = $(el).find("span");
									const b = a.parent().contents();
									const text = parseInt(
										$(b[Array.prototype.findIndex.call(b, (elem) => $(elem).is(a)) + 1])
											.text()
											.trim(),
										10
									);
									const direction = a.text();

									if (direction.includes("Up")) {
										urls[i].up = text;
									} else if (direction.includes("Down")) {
										urls[i].down = text;
									}
								});
								urls[i].average = (urls[i].up / (urls[i].down + urls[i].up)) * 100;

								const res = await axios.head(urls[i].url, { timeout: 2000 });
								urls[i].type = res.headers["content-type"] as string;
							})
							.catch(() => {
								//
							})
					);
				}
			});
		await Promise.all(promisses).catch(() => {
			//
		});
	} catch {
		//
	}

	return urls
		.filter(async (u) => (await axios.head<any>(u.url, { timeout: 2000 }).catch(() => ({ status: 500 }))).status < 400)
		.filter((a) => !a.type.includes("gif"))
		.filter((a) => a.average > 40)
		.sort((a, b) => b.up - a.up)
		.concat(
			urls
				.filter((a) => a.average <= 40)
				.filter((a) => !a.type.includes("gif"))
				.sort((a, b) => b.up - a.up)
		)
		.concat(urls.filter((a) => a.type.includes("gif")).sort((a, b) => b.average - a.average));
};

export const storageArtistImageInDatabase = async function (name, storagePath) {
	const artist = await confDb.artist.findFirst({
		where: {
			name: name,
		},
	});
	if (!artist?.name) {
		return;
	}

	await confDb.artist.update({
		where: {
			id: artist.id,
		},
		data: {
			cover: `/Music/${storagePath}`,
		},
	});
};
export const downloadImage = function (url, destination) {
	return new Promise(async (resolve, reject) => {
		const folder = destination.replace(/[\/\\][^\\\/]+$/u, "");
		
		try {
			if (!fs.existsSync(folder)) {
				fs.mkdirSync(folder, { recursive: true });
			}
			const writer = fs.createWriteStream(destination);

			const response = await axios({
				url,
				method: "GET",
				responseType: "stream",
				timeout: 2000,
			});

			response.data.pipe(writer);

			writer.on("finish", resolve);
			writer.on("error", reject);
		} catch (error) {
			reject(error);
		}
		resolve(null);
	});
};

export const getBestArtistImag = async function (artist: string, storagePath: string) {
	const image = (await artistImages(artist))[0];

	let result: boolean | null = false;
	let extension: string | null = '';

	if (image) {
		extension = image.type.replace('image/', '').replace('jpeg', 'jpg');
		await downloadImage(image.url, `${storagePath}.${extension}`.replace(/[\\\/]undefined/gu,'').replace('undefined','png'))
			.then(() => (result = true))
			.catch(() => {
				//
			});
	}

	return result ? {
		path: `${storagePath}.${extension}`.replace(/[\\\/]undefined/gu,'').replace('undefined','png'),
		extension: extension,
		url: image.url,
	} : null;
};
