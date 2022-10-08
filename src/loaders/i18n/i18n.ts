import i18next from 'i18next';
import middleware from 'i18next-http-middleware';
import FsBackend from 'i18next-node-fs-backend';

i18next
	.use(FsBackend)
	.use(middleware.LanguageDetector)
	.init({
		fallbackLng: 'en',
		saveMissing: true,
		debug: false,
	});

export default i18next;
