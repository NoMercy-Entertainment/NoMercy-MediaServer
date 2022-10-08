import tmdbApiClient from '../tmdbApiClient';
import i18next from 'i18next';
import { TvCertifications } from './tv_certifications';
import { MovieCertifications } from './movie_certifications';

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
		movieCertifications().then((movie) => {
            for (let i = 0; i < Object.keys(movie).length; i++) {
                const key = Object.keys(movie)[i];
                const certification = movie[key];

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
		tvCertifications().then((tv) => {
            for (let i = 0; i < Object.keys(tv).length; i++) {
                const key = Object.keys(tv)[i];
                const certification = tv[key];

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

	const { data } = await tmdbApiClient.get<TvCertifications>('certification/tv/list', params);

	return data.certifications;
};

export const movieCertifications = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await tmdbApiClient.get<MovieCertifications>('certification/movie/list', params);

	return data.certifications;
};
