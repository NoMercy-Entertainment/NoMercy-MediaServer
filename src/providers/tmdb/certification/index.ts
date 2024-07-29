import { MovieCertifications } from './movie_certifications';
import { TvCertifications } from './tv_certifications';
import i18next from 'i18next';
import tmdbClient from '../tmdbClient';

export * from './movie_certifications';
export * from './tv_certifications';

export interface CertificationList {
	iso_3166_1: string;
	meaning: string;
	order: number;
	certification: string;
}

export default async function certifications(): Promise<Array<CertificationList>> {
	const data: Array<CertificationList> = [];

	await Promise.all([
		movieCertifications()
			.then((certs) => {
				for (let i = 0; i < Object.keys(certs).length; i++) {
					const key = Object.keys(certs)[i];
					const certification = certs[key];

					for (let j = 0; j < certification.length; j++) {
						const cert = certification[j];
						data.push({
							iso_3166_1: key,
							meaning: cert.meaning,
							order: cert.order,
							certification: cert.certification,
						});
					}
				}
			}),
		tvCertifications()
			.then((certs) => {
				for (let i = 0; i < Object.keys(certs).length; i++) {
					const key = Object.keys(certs)[i];
					const certification = certs[key];

					for (let j = 0; j < certification.length; j++) {
						const cert = certification[j];
						data.push({
							iso_3166_1: key,
							meaning: cert.meaning,
							order: cert.order,
							certification: cert.certification,
						});
					}
				}
			}),
	]);

	return data;
}

export const tvCertifications = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await new tmdbClient().get<TvCertifications>('certification/tv/list', params);

	return data.certifications;
};

export const movieCertifications = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await new tmdbClient().get<MovieCertifications>('certification/movie/list', params);

	return data.certifications;
};
