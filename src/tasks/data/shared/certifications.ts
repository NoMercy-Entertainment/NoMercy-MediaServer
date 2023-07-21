import Logger from '@server/functions/logger/logger';
import { Certification } from '@server/providers/tmdb/movie/index';
import { ContentRating } from '@server/providers/tmdb/shared/index';
import { insertCertification } from '@server/db/media/actions/certifications';

export default function (certifications: Array<Certification | ContentRating>) {
	for (const cr of certifications) {
		try {
			insertCertification({
				iso31661: cr.iso_3166_1,
				rating: (cr as Certification).certification ?? (cr as ContentRating).rating,
				meaning: cr.meaning,
				order: parseInt(cr.order, 10),
			});

		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify([`${__filename}`, error]),
			});
		}
	};
}
