import { Certification } from '../../providers/tmdb/movie/index';
import { ContentRating } from '../../providers/tmdb/shared/index';
import { Prisma } from '@prisma/client';
import { commitConfigTransaction } from '../../database';
import { confDb } from '../../database/config';

export default async function (certifications: Array<Certification | ContentRating>) {
	const transaction: any[] = [];

	certifications.map((cr) => {
		const certificationsInsert = Prisma.validator<Prisma.CertificationUncheckedCreateInput>()({
			iso31661: cr.iso_3166_1,
			rating: (cr as Certification).certification ?? (cr as ContentRating).rating,
			meaning: cr.meaning,
			order: parseInt(cr.order, 10),
		});

		transaction.push(
			confDb.certification.upsert({
				where: {
					rating_iso31661: {
						iso31661: cr.iso_3166_1,
						rating: (cr as Certification).certification ?? (cr as ContentRating).rating,
					},
				},
				update: certificationsInsert,
				create: certificationsInsert,
			})
		);
	});

	await commitConfigTransaction(transaction);
}
