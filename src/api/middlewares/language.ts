import i18next from '../../loaders/i18n';

/**
 * @param {import('express').Request} req
 */
const changeLanguage = (req, res, next) => {
	const locale = req.acceptsLanguages()[0] == 'undefined' ? 'en' : req.acceptsLanguages()?.[0]?.split('-')?.[0];
	i18next.changeLanguage(locale);
	next();
};

export default changeLanguage;
