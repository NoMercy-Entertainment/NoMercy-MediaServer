import { PersonCast } from '../../providers/tmdb/people/credits';
import { person } from '../../providers/tmdb/people/index';
import { searchPeople } from '../../providers/tmdb/search/index';
import { imageCrawler } from '../../providers/tvdb';
import axios from 'axios';

export interface ImageResult extends PersonCast {
	href: string;
	img: string;
}

export default async (type: string, title: string, date: string) => {
	return new Promise<ImageResult[]>(async (resolve, reject) => {
		const imageResult: ImageResult[] = [];

		const year = new Date(Date.parse(date)).getFullYear();

		title = title.replace(/\s/gu, '-').toLowerCase().match(/[^!*'();:@&=+$,/?%#\[\]]+/)![0];

		let url:string = `https://thetvdb.com/${type}/${title}/people`;
		await axios.head(`https://thetvdb.com/${type}/${title}-${year}/people`)
			.then(() => {
				url = `https://thetvdb.com/${type}/${title}-${year}/people`
			}).catch(() => {
				url = `https://thetvdb.com/${type}/${title}/people`
			});

		try {
			const people = await imageCrawler(url);

			for (let i = 0; i < people!.length; i++) {
				const p = people![i];

				await searchPeople(p.actor).then(async (personData) => {
					for (let j = 0; j < personData.length; j++) {
						await person(personData[j].id).then((personDetails) => {
							const characterResult: PersonCast = 
								personDetails.credits.cast.find((c) =>
									c.character?.includes(p.character) &&
										c.title?.replace(/-/g, ' ')?.replace(/:/g, '')?.toLowerCase() == p.title?.toLowerCase()
									) 
									?? personDetails.credits.cast.find((c) =>
										c.character?.includes(p.character))
									?? personDetails.credits.cast.find((c) =>
										p.character?.includes(c.character))!;

							if (characterResult) {
								imageResult.push({
									...p,
									...characterResult,
								});
							}
						});
					}
				});
			}

			resolve(imageResult);
		} catch (error) {
			reject(error);
		}
	});
};
