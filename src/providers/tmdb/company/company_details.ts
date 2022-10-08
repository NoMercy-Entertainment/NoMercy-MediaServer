import { Company } from './company';

export interface CompanyDetails extends Company {
	description: string;
	headquarters: string;
	homepage: string;
	parent_company: string;
}
