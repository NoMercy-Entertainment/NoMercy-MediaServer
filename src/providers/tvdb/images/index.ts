import TVDBImageCrawler from './imageCrawler';

export * from './imageCrawler';

export const imageCrawler = async (url: string) => {
	const tmdb = new TVDBImageCrawler(url);

	return await tmdb.getData();
};
