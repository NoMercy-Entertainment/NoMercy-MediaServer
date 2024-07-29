import { NextFunction, Request, Response } from 'express';
import { getLanguage } from '.';
import i18next from '../../loaders/i18n';

const changeLanguage = (req: Request, res: Response, next: NextFunction) => {

	const language = getLanguage(req);

	i18next.changeLanguage(language);

	next();
};

export default changeLanguage;
