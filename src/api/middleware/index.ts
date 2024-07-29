import { Request } from 'express';

export const getLanguage = (req: Request) => {

	if (
		!req.acceptsLanguages()
		|| !req.acceptsLanguages()[0]
		|| req.acceptsLanguages()[0] == '*'
		|| req.acceptsLanguages()[0] == 'undefined'
	) {
		return 'en';
	}
	return req.acceptsLanguages()[0].split('-')[0] ?? 'en';
};

export const getCountry = (req: Request) => {
	if (
		!req.acceptsLanguages()
		|| !req.acceptsLanguages()[0]
		|| req.acceptsLanguages()[0] == '*'
		|| req.acceptsLanguages()[0] == 'undefined'
	) {
		return 'US';
	}
	return req.acceptsLanguages()[0].split('-')[1] ?? 'US';
};
