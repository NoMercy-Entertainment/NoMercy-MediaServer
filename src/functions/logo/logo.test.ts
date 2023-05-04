import { createQuote } from './logo';

describe('createQuote', () => {
	it('should create a quote with correct length', () => {
		const text = 'When there is no desire, all things are at peace. - Laozi';
		const rightPadding = 6;
		const expectedLength = 110;
		const quote = createQuote(text, rightPadding);
	  	expect(quote.length).toBe(expectedLength);
	});

	it('should throw an error if text is too long', () => {
		const text = 'When there is no desire, all things are at peace. - Laozi When there is no desire, all things are at peace. - Laozi When there is no desire, all things are at peace. - Laozi';
		const rightPadding = 10;
		expect(() => {
			createQuote(text, rightPadding);
		}).toThrowError('The text is too long to fit in the quote');
	});
});
