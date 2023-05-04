import { stringFormat } from './stringFormat';

describe('stringFormat', () => {
	it('should replace placeholders with the given values', () => {
		const result = stringFormat('/{0}/{1}/season/{2}/episode/{3}?api_key={4}&language={5}', 'tv', 1433, 1, 1, 'ABCDEFGHIJK', 'en-US');
		expect(result).toEqual('/tv/1433/season/1/episode/1?api_key=ABCDEFGHIJK&language=en-US');
	});

	it('should return empty string when template is not provided', () => {
		const result = stringFormat('', 'tv', 1433, 1, 1, 'ABCDEFGHIJK', 'en-US');
		expect(result).toEqual('');
	});

	it('should handle missing values gracefully', () => {
		const result = stringFormat('/{0}/{1}/season/{2}/episode/{3}?api_key={4}&language={5}', 'tv', 1433);
		expect(result).toEqual('/tv/1433/season//episode/?api_key=&language=');
	});
});
