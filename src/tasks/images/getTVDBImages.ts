import { Cast } from '../../providers/tmdb/shared';
import { CompleteMovieAggregate } from '../../tasks/data/fetchMovie';
import { CompleteTvAggregate } from '../../tasks/data/fetchTvShow';
import axios from 'axios';
import { imageCrawler } from '../../providers/tvdb';
import { person } from '../../providers/tmdb/people/index';
import { searchPeople } from '../../providers/tmdb/search/index';

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
			.replace(/&/gu, 'and')
			.replace(/[!*'();:@&=+$,/?%#\[\]]/gu, '')
			.toLowerCase();

		let url = `https://thetvdb.com/${type}/${title}/people`;
		await axios.get(`https://thetvdb.com/${type}/${title}-${year}/people`)
			.then(() => {
				url = `https://thetvdb.com/${type}/${title}-${year}/people`;

			})
			.catch(async () => {

				await axios.get(`https://thetvdb.com/${type}/${title}-show/people`)
					.then(() => {
						url = `https://thetvdb.com/${type}/${title}-show/people`;
					})
					.catch(async () => {
						await axios.get(`https://thetvdb.com/${type}/the-${title}/people`)
							.then(() => {
								url = `https://thetvdb.com/${type}/the-${title}/people`;
							})
							.catch(() => {
								url = `https://thetvdb.com/${type}/${title}/people`;
							});
					});
			});

		try {
			const people = await imageCrawler(url);
			if (!people) return;

			const promises: any[] = [];

			for (let i = 0; i < people.length; i++) {
				const p = people[i];

				const credit = req.credits.cast
					.find(c => c.character.toLowerCase().includes(p.character.toLowerCase()));

				if (credit) {
					imageResult.push({
						...p,
						...credit,
					});

					continue;
				}

				await searchPeople(p.actor)
					.then((personData) => {
						for (let j = 0; j < personData.length; j++) {

							promises.push(
								person(personData[j].id)
									.then((personDetails) => {

										let characterResult: Cast | undefined = personDetails.tv_credits.cast
											.find(c => c.character?.toLowerCase().includes(p.character.toLowerCase()));

										if (!characterResult) {
											characterResult = personDetails.movie_credits.cast
												.find(c => c.character?.toLowerCase().includes(p.character.toLowerCase()));
										}

										if (!characterResult) {
											characterResult = personDetails.credits.cast
												.find(c => c.name == p.actor) as unknown as Cast;
										}

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
