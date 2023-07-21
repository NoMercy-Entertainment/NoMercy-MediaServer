import { Cast } from '@server/providers/tmdb/shared';
import { CompleteMovieAggregate } from '../data/movie/fetchMovie';
import { CompleteTvAggregate } from '../data/tv/fetchTvShow';
import axios from 'axios';
import { imageCrawler } from '@server/providers/tvdb';
import { person } from '@server/providers/tmdb/people/index';
import { searchPeople } from '@server/providers/tmdb/search/index';

export interface ImageResult extends Cast {
	href: string;
	img: string;
}

export default (type: string, req: CompleteTvAggregate | CompleteMovieAggregate) => {
	return new Promise<ImageResult[]>(async (resolve, reject) => {
		const imageResult: ImageResult[] = [];
		let title = (req as CompleteMovieAggregate).title ?? (req as CompleteTvAggregate).name;
		const date = (req as CompleteTvAggregate).first_air_date ?? (req as CompleteMovieAggregate).release_date;

		const year = new Date(Date.parse(date)).getFullYear();

		title = title
			.replace(/\s/gu, '-')
			.replace(/\./gu, '')
			.replace(/'/gu, '')
			.replace(/:/gu, '')
			.replace(/-{2,}/gu, '-')
			.replace(/&/gu, 'and')
			.replace(/-$/u, '')
			.replace(/[!*'();:@&=+$,/?%#\[\]]/gu, '')
			.toLowerCase();

		let url = `https://thetvdb.com/${type}/${title}#castcrew`;
		await axios.get(`https://thetvdb.com/${type}/${title}-${year}#castcrew`)
			.then(() => {
				url = `https://thetvdb.com/${type}/${title}-${year}#castcrew`;

			})
			.catch(async () => {

				await axios.get(`https://thetvdb.com/${type}/${title}-show#castcrew`)
					.then(() => {
						url = `https://thetvdb.com/${type}/${title}-show#castcrew`;
					})
					.catch(async () => {
						await axios.get(`https://thetvdb.com/${type}/the-${title}#castcrew`)
							.then(() => {
								url = `https://thetvdb.com/${type}/the-${title}#castcrew`;
							})
							.catch(() => {
								url = `https://thetvdb.com/${type}/${title}#castcrew`;
							});
					});
			});

		try {
			const people = await imageCrawler(url);
			if (!people) return;

			const promises: any[] = [];

			for (let i = 0; i < people.length; i++) {
				const p = people[i];

				let credit = req.credits.cast
					.find(c => c.character.toLowerCase().includes(p.character.toLowerCase()));

				if (!credit) {
					credit = req.credits.cast
						.find(c => c.name.toLowerCase().includes(p.actor.toLowerCase()));
				}

				if (credit) {
					imageResult.push({
						...p,
						...credit,
					});

					continue;
				}

				await searchPeople(p.actor)
					.then(async (personData) => {
						for (let j = 0; j < personData.length; j++) {

							promises.push(
								await person(personData[j].id)
									.then((personDetails) => {

										let characterResult: Cast | undefined = personDetails.tv_credits.cast
											.find(c => c.character?.toLowerCase().includes(p.character.toLowerCase()));

										if (!characterResult) {
											characterResult = personDetails.movie_credits.cast
												.find(c => c.character?.toLowerCase().includes(p.character.toLowerCase()));
										}

										// if (!characterResult) {
										// 	characterResult = personDetails.credits.cast
										// 		.find(c => c.name == p.actor);
										// }

										if (characterResult) {
											imageResult.push({
												...p,
												...characterResult,
											});
										}
									})
							);
						}
					});
			}

			await Promise.all(promises).catch(error => reject(error));

			resolve(imageResult);
		} catch (error) {
			resolve([]);
		}
	});
};
