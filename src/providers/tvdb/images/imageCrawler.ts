import axios from 'axios';
import { AnyNode, load } from 'cheerio';
import Logger from '../logger';

export interface ImageData {
    id: number;
    href: string;
    img: string;
    actor: string;
    character: string;
    title: string;
}

export default class TVDBImageCrawler {
	#url = '';

	constructor(url: string) {
		this.#url = url;
	}

	getData = async () => {
		Logger.info({
			name: 'TVDBImage',
			color: 'blueBright',
			message: `Getting data ${this.#url}`,
			level: 'info',
		});
		const response = await axios.get(this.#url);
		if (response.status == 200) {
			const parsedData = this.#parseData(response.data, this.#url);
			return parsedData;
		}
	};

	#parseData = (response: string | AnyNode | AnyNode[] | Buffer, url: string) => {

		const result: ImageData[] = [];

		const $ = load(response);

		$('.thumbnail')
			.each((i, el) => {
				const h3 = $(el).find('h3');
				const a = h3.parent().contents();
				const text = $(a[Array.prototype.findIndex.call(a, elem => $(elem).is(h3))])
					.text()
					.replace(/[\n\r]/gu, '')
					.replace(/ +(?= )/gu, '')
					.trim()
					.split(' as ');

				const span = $(el).find('span');
				const c = span.parent().contents();
				const text3 = $(c[Array.prototype.findIndex.call(c, elem => $(elem).is(span))])
					.text()
					.replace(/[\n\r]/gu, '')
					.replace(/ +(?= )/gu, '')
					.trim();

				if (text3) return;

				const imgSrc
                    = $(el).find('img')
                    	.attr('data-src')
                    ?? $(el).closest('img')
                    	.attr('data-src')
                    ?? $(el).find('img')
                    	.attr('src')
                    ?? $(el).closest('img')
                    	.attr('src');

				const href = $(el).parent()
					.attr('href');
				const id = href!.split('/').reverse()[0];
				const title = url.split('/')[4]?.replace(/-/gu, ' ');

				result.push({
					id: parseInt(id, 10),
					href: href!,
					img: imgSrc!,
					actor: text[0],
					character: text[1],
					title: title,
				});
			});

		return result;
	};
}
