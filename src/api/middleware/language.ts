import { getLanguage } from '.';
import i18next from '../../loaders/i18n';

/**
 * @param {import('express').Request} req
 */
const changeLanguage = (req, res, next) => {

	const language = getLanguage(req);

	i18next.changeLanguage(language);

	next();
};

export default changeLanguage;
